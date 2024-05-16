<template>
    <v-app class="bg-white">
        <v-container fluid>
          <v-alert v-if="success" :text="messages" type="success"></v-alert>
          <v-alert v-if="error" :text="messages" type="error"></v-alert>

          <v-sheet class="mx-auto" color="white">
              <v-form @submit.prevent="generate">
                <v-text-field
                    v-model="inputText"
                    :rules="rules"
                    label="Word"
                    placeholder="Please enter a word"
                    outlined
                />
                <div class="d-flex justify-end">
                    <v-btn :loading="submit" color="primary" type="submit" block>Generate</v-btn>
                </div>
              </v-form>
          </v-sheet>
        </v-container>        
    </v-app>
  </template>
  
  <script>
  import { ref } from 'vue';
  const ankiUrl = import.meta.env.VITE_ANKI_URL;
  const openaiUrl = import.meta.env.VITE_OPENAI_API_KEY;

  export default {
    data() {
      return {
        messages: ref(''),
        success: ref(false),
        error: ref(false),
        submit: ref(false),
        inputText: ref(''),
        rules: [
        value => {
            if (value) return true

            return 'You must enter a word'
            },
        ],
      };
    },
    methods: {
      setAlert (type, message) {
        console.log(message);
        this[type] = true;
        this.messages = message ? message : (type === 'success') ? 'The card has been generated successfully' : 'Error when generating the card';

        setTimeout(() => {
          this[type] = false;
          this.message = '';
        }, 5000);
      },
      async sendToOpenAi(message) {

        const content = `
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

        try {
            const response = await this.$http.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                { role: 'user', content: content },
                ],
            },
            {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiUrl}`,
                },
            }
            );

            /* 
            The response data is markdown:
            ```json
            {
                "Word": "Test",
                "Word Type": "Noun",
                "Reading": "測試",
                "Definition": "a way of discovering, by questions or practical activities, what someone knows, or what someone or something can do or is like",
                "Sentence(s)": "She did a test to see how well the students could pronounce the English words.",
                "Other(s)": "Synonyms: examination, quiz, assessment"
            }
            ```            
            */
            const json = response.data.choices[0].message.content.replace(/```json|```/g, '');
            const data = JSON.parse(json);
            console.log(data);
            
            

            return data;
        } catch (error) {
            throw new Error(error);
        }
      },
      async generate() {
        this.submit = true;

        try {

            const data = await this.sendToOpenAi(this.inputText);

            const body = {
                "action": "addNote",
                "version": 6,
                "key": "myankikey",
                "params": {
                    "note": {
                        "deckName": "英文單字",
                        "modelName": "Custom Template",
                        "fields": {
                            "Word": data.Word,
                            "Word Type": data["Word Type"],
                            "Reading": data.Reading,
                            "Definition": data.Definition,
                            "Sentence(s)": data["Sentence(s)"],
                            "Other(s)": data["Other(s)"]
                        }
                    }
                }
            };

            this.$http.post(ankiUrl, body).then((res) => {
                console.log(res);
                this.setAlert('success');
                this.submit = false;
            }).catch((error) => {
                console.log(error);
                this.setAlert('error');
                this.submit = false;
            });
        } catch (error) {
            console.log(error);
            this.setAlert('error');
            this.submit = false;
        }
      },
    },
  };
  </script>
  