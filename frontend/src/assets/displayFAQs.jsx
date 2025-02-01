import {
  HStack,
  Box,
  Text,
  Button,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useClipboard,
  Container,
  useToast,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { useState } from "react";
import { IoCopy } from "react-icons/io5";

export function DisplayFAQs({ faq, onDelete }) {
  const [language, setLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const availableLanguages = Object.keys(faq.translations || {});
  const { hasCopied, onCopy } = useClipboard();
  const [deload, setDeload] = useState(false);
  const toast = useToast();

  const handleLanguageChange = (lang) => {
    setLang(lang);
    setIsOpen(false);
  };

  const seeDelete = async (id) => {
    setDeload(true);
    await onDelete(id);
    setDeload(false);
    toast({
      status: "success",
      description: "FAQ Deleted!",
      duration: 3000,
      isClosable: true,
      colorScheme: "red",
      position: "top",
    });
  };

  const displayQuestion = faq.translations[language]?.question || faq.question;
  const displayAnswer = faq.translations[language]?.answer || faq.answer;

  return (
    <Container borderWidth={1} borderRadius="md">
      <HStack key={faq.id} w="100%" justify="space-between" p={2}>
        <Box>
          <Text>
            <strong>Q.</strong> {displayQuestion}
          </Text>
          <Text dangerouslySetInnerHTML={{ __html: displayAnswer }}></Text>
        </Box>
        <HStack mt={"-3px"}>
          <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            placement="bottom-start"
          >
            <PopoverTrigger>
              <Button size={"sm"} onClick={() => setIsOpen(!isOpen)}>
                Change Language
              </Button>
            </PopoverTrigger>
            <PopoverContent fontSize={"sm"}>
              <PopoverArrow />
              <PopoverBody>
                <ul style={{ padding: "0", listStyle: "none" }}>
                  <li
                    onClick={() => handleLanguageChange("en")}
                    style={{
                      backgroundColor:
                        language === "en" ? "#e2e8f0" : "transparent",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    English
                  </li>
                  {availableLanguages.map((lang) => (
                    <li
                      key={lang}
                      style={{
                        backgroundColor:
                          language === lang ? "#e2e8f0" : "transparent",
                        padding: "8px 16px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Button
            colorScheme="red"
            size="sm"
            isLoading={deload}
            onClick={() => seeDelete(faq.id)}
          >
            Delete
          </Button>
        </HStack>
      </HStack>
      <HStack mt={"3px"} justify={"center"}>
        <Box mb={"3px"}>
          <strong>{faq.id}</strong>
          <Button onClick={onCopy} size={"sm"}>
            {hasCopied ? "✅" : <IoCopy />}
          </Button>
        </Box>
      </HStack>
    </Container>
  );
}

DisplayFAQs.propTypes = {
  faq: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};
