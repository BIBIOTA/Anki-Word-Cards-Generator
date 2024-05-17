<template>
    <v-app class="bg-white">
        <v-container fluid>
          <v-alert v-if="alertStatus === 'success'" :text="messages" type="success"></v-alert>
          <v-alert v-if="alertStatus === 'error'" :text="messages" type="error"></v-alert>

          <v-tabs
            v-model="tab"
            bg-color="primary"
          >
            <v-tab value="1">Word</v-tab>
            <v-tab value="2">Copy from Dictionary</v-tab>
          </v-tabs>

          <v-sheet class="mx-auto" color="white">
              <v-form @submit.prevent="generate">
                <v-text-field
                    v-if="tab === '1'"
                    v-model="inputText"
                    :rules="rules"
                    label="Word"
                    placeholder="Please enter a word"
                    outlined
                />
                <v-textarea v-else label="Copy from Dictionary" :rules="rules" v-model="inputText" outlined></v-textarea>
                <div class="d-flex justify-end">
                    <v-btn :loading="submit" color="primary" type="submit" block>Generate</v-btn>
                </div>
              </v-form>
          </v-sheet>
        </v-container>        
    </v-app>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import axios from "axios";

  const ANKI_URL = import.meta.env.VITE_ANKI_URL;
  const OPENAI_URL = import.meta.env.VITE_OPENAI_API_KEY;

  enum Tab {
    Word = '1',
    CopyFromDictionary = '2',
  };

  enum Alert {
    Success = 'success',
    Error = 'error',
    None = '',
  };

  type ankiFields = {
    Word: string;
    "Word Type": string;
    Reading: string;
    Definition: string;
    "Sentence(s)": string;
    "Other(s)": string;
  };

  type ankiBody = {
    action: string;
    version: number;
    key: string;
    params: object;
  };

  type ankiResponse = {
    error: string;
    result: string[];
  };

  const tab = ref<Tab>(Tab.Word);
  const alertStatus = ref<Alert>(Alert.None);
  const messages = ref('');
  const submit = ref(false);
  const inputText = ref('');
  const rules = [
    (value?: string) => {
      if (value) {
        return true;
      }

      return 'You must enter a word';
    },
  ];
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
    "Sentence(s)" => String (Multiple examples with sentence translation (If sentence translation exists) to HTML. Wrap each example with <br> tag. Example: She did a test to see how well the students could pronounce the English words. <br> 她做了一個測試，看看學生們能否發音英文單字。 <br> He did a test to see how well the students could pronounce the English words. <br> 他做了一個測試，看看學生們能否發音英文單字。)
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

  const setAlert = (type: Alert, message?: string): void => {
    console.log(message);
    alertStatus.value = type;
    messages.value = message ? message : (type === Alert.Success) ? 'The card has been generated successfully' : 'Error when generating the card';

    setTimeout(() => {
      alertStatus.value = Alert.None;
      messages.value = '';
    }, 5000);
  };

  const getContent = (message: string): string => {
      if (tab.value === Tab.CopyFromDictionary) {
          return getDictionaryPrompt(message);
      }

      return getWordPrompt(message);
  }

  const getFieldsFromOpenAi = async (message: string): Promise<ankiFields> => {

      const content = getContent(message);

      try {
          const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_URL}`,
              },
              body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                  { role: 'user', content: content },
              ],
              }),
          }
          );

          const data = await response.json();
          const json = data.choices[0].message.content.replace(/```json|```/g, '');
          // set result to ankiFields type
          const result: ankiFields = JSON.parse(json);
          console.log(result);

          return result;
      } catch (error: any) {
          throw new Error(error);
      }
  };

  const createCard = async (fields: ankiFields): Promise<ankiResponse> => {
      try {
          const body: ankiBody = {
              "action": "addNote",
              "version": 6,
              "key": "myankikey",
              "params": {
                  "note": {
                      "deckName": "英文單字",
                      "modelName": "Custom Template",
                      "fields": fields,
                  }
              }
          };

          const response = await axios.post(ANKI_URL, body);
          console.log(response.data);

          return response.data;
      } catch (error: any) {
          throw new Error(error);
      }
  };

  const findCard = async (word: string): Promise<ankiResponse> => {
      try {

          const body: ankiBody = {
              "action": "findNotes",
              "version": 6,
              "key": "myankikey",
              "params": {
                  "query": `Word:${word}`
              }
          };

          const response = await axios.post(ANKI_URL, body);

          console.log(response.data);

          return response.data;
      } catch (error: any) {
          throw new Error(error);
      }
  };

  const updateCard = async (fields: ankiFields, id: string): Promise<ankiResponse> => {
      try {
          const body: ankiBody = {
              "action": "updateNoteFields",
              "version": 6,
              "key": "myankikey",
              "params": {
                  "note": {
                      "id": id,
                      "fields": fields
                  }
              }
          };

          const response = await axios.post(ANKI_URL, body);

          console.log(response.data);

          return response.data;
      } catch (error: any) {
          throw new Error(error);
      }
  };

  const generate = async () => {
    submit.value = true;

    try {

        const fields = await getFieldsFromOpenAi(inputText.value);

        const createdData = await createCard(fields);

        if (createdData.error === 'cannot create note because it is a duplicate') {
          const findCardData = await findCard(fields.Word);

          if (findCardData.error || findCardData.result.length === 0) {
              throw new Error(findCardData.error);
          }

          const updateCardData = await updateCard(fields, findCardData.result[0]);

          if (updateCardData.error) {
              throw new Error(updateCardData.error);
          }
        }
        setAlert(Alert.Success, 'The card has been generated successfully');
        submit.value = false;
    } catch (error) {
        console.log(error);
        setAlert(Alert.Error);
        submit.value = false;
    }
  };
  </script>
  