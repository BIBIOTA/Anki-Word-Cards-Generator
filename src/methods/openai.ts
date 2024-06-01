  import axios from "axios";
  import { ankiFields } from "../types/generator";

  const getFieldsFromOpenAi = async (content: string): Promise<ankiFields> => {
    return axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content },
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

  export default {
    getFieldsFromOpenAi,
  }
