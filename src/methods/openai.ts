  import axios from "axios";
  import { Tab } from "../enums/generator";
  import { ankiFields } from "../types/generator";

  const getDictionaryPrompt = (message: string): string => {
    return `
    Please convert this dictionary word to Json.
    \`\`\`
    ${message}
    \`\`\`

    The response key and type of json that required:
    \`\`\`
    "Word" => String
    "Word Type" => String
    "Reading" => String (It's translated word by Chinese Traditional.)
    "Definition" => String
    "Sentence(s)" => String to HTML. Wrap each example with <br> tag. Example: She did a test to see how well the students could pronounce the English words. Please includes every sentence with Chinese traditional translate. For Example: \`\`\`1. She did a test to see how well the students could pronounce the English words.
     <br> 她做了一個測試，看看學生們能否發音英文單字。 <br> 2. He did a test to see how well the students could pronounce the English words. <br> 他做了一個測試，看看學生們能否發音英文單字。 3. They did a test to see how well the students could pronounce the English words. <br> 他們做了一個測試，看看學生們能否發音英文單字。 \`\`\`
    "Other(s)" => String
    \`\`\`
    `;
  };

  const getWordPrompt = (message: string): string => {
    return `
    Word: \`${message}\`
    Please make the word's detail from Cambridge English-Chinese Dictionary.
    The response type is json that required:
    \`\`\`
    "Word" => String
    "Word Type" => String
    "Reading" => String (It's translated word by Chinese Traditional)
    "Definition" => String
    "Sentence(s)" => String
    "Other(s)" => String
    \`\`\`
    `;
  };


  const getContent = (message: string, tab: Tab): string => {
    if (tab === Tab.CopyFromDictionary) {
        return getDictionaryPrompt(message);
    }

    return getWordPrompt(message);
  }

  const getFieldsFromOpenAi = async (message: string, tab: Tab): Promise<ankiFields> => {
    return axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: getContent(message, tab) },
      ],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      }
    }).then((response) => {
      const data = response.data;
      const json = data.choices[0].message.content.replace(/```json|```/g, '');
      const result: ankiFields = JSON.parse(json);

      return result;  
    }).catch((error) => {
      throw new Error(error);
    });
  };

  export default getFieldsFromOpenAi;
