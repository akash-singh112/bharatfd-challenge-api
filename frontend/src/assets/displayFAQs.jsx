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
  useToast,
  List,
  ListItem,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { useState } from "react";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

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
    <VStack
      borderWidth={1}
      borderRadius="md"
      maxWidth={"80vw"}
      minWidth={"40vw"}
    >
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
                <List style={{ padding: "0", listStyle: "none" }}>
                  <ListItem
                    onClick={() => handleLanguageChange("en")}
                    bg={language === "en" ? "gray.200" : "transparent"}
                    p={2}
                    cursor="pointer"
                    transition="0.2s"
                    _hover={{ bg: "gray.300" }}
                  >
                    English
                  </ListItem>
                  {availableLanguages.map((lang) => (
                    <ListItem
                      key={lang}
                      bg={language === lang ? "gray.200" : "transparent"}
                      p={2}
                      cursor="pointer"
                      transition="0.2s"
                      onClick={() => handleLanguageChange(lang)}
                      _hover={{ bg: "gray.300" }}
                    >
                      {lang.toUpperCase()}
                    </ListItem>
                  ))}
                </List>
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
        <HStack mb={"3px"} gap={"15px"}>
          <Text>
            UUID: <strong>{faq.id}</strong>
          </Text>
          <Button
            colorScheme={!hasCopied ? "blue" : "green"}
            onClick={() => onCopy(faq.id)}
            size={"sm"}
          >
            {hasCopied ? <LuCopyCheck /> : <LuCopy />}
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
}

DisplayFAQs.propTypes = {
  faq: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};
