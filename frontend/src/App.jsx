import { useEffect, useState } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Button,
  Input,
  VStack,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useToast,
  List,
  ListItem,
} from "@chakra-ui/react";
import { DisplayFAQs } from "./assets/displayFAQs";
import { call } from "./apis/apicall";
import { Editor } from "@tinymce/tinymce-react";
import { sortedLanguages as availableLanguages } from "./assets/languagesArray";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
} from "react-icons/io";

function App() {
  const [faqs, setFaqs] = useState([]);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [lan, setLan] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    const res = await call({}, "get", "get-faqs");
    setFaqs(res.content);
  };

  const handleLanguageChange = (lang) => {
    setLan(lang);
    setIsOpen(false);
  };

  const addFAQ = async () => {
    setLoading(true);
    const details = { question: q, answer: a };
    const res = await call(details, "post", "create-faq", lan);
    const newFaqArr = [...faqs];
    newFaqArr.push(res.content);
    setFaqs(newFaqArr);
    setLoading(false);
    toast({
      title: "Success",
      status: "success",
      description: "FAQ added!",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const handleDelete = async (id) => {
    await call({}, "delete", "del", id);
    setFaqs(faqs.filter((faq) => faq.id != id));
  };

  return (
    <ChakraProvider>
      <Box p={5} maxW="600px" mx="auto">
        <Heading mb={4}>FAQ Management Dashboard</Heading>
        <VStack spacing={3}>
          {faqs.map((faq) => (
            <DisplayFAQs key={faq.id} faq={faq} onDelete={handleDelete} />
          ))}
        </VStack>
        <Box mt={5}>
          <Input
            name="question"
            placeholder="Enter question..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            mb={2}
          />
          <Box mt={"2px"} mb={"7px"}>
            <Popover
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              placement="bottom-start"
            >
              <PopoverTrigger>
                <Button
                  colorScheme="yellow"
                  leftIcon={
                    !isOpen ? (
                      <IoIosArrowDropdownCircle />
                    ) : (
                      <IoIosArrowDropupCircle />
                    )
                  }
                  size={"sm"}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  Change Language
                </Button>
              </PopoverTrigger>
              <PopoverContent
                fontSize={"sm"}
                maxHeight={"300px"}
                overflowY={"auto"}
              >
                <PopoverArrow />
                <PopoverBody>
                  <List style={{ padding: "0", listStyle: "none" }}>
                    {availableLanguages.map(({ code, name }) => (
                      <ListItem
                        key={code}
                        bg={lan === code ? "gray.200" : "transparent"}
                        p={2}
                        cursor="pointer"
                        transition="0.2s"
                        onClick={() => handleLanguageChange(code)}
                        _hover={{ bg: "gray.300" }}
                      >
                        {name.toUpperCase()}
                      </ListItem>
                    ))}
                  </List>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
          <Editor
            apiKey={import.meta.env.VITE_EDITOR_KEY}
            value={a}
            onEditorChange={(newContent) => setA(newContent)}
            init={{
              placeholder: "Start writing...",
              height: 500,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
          <Button
            isLoading={loading}
            colorScheme="blue"
            onClick={addFAQ}
            mt={"3px"}
          >
            Add FAQ
          </Button>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App;
