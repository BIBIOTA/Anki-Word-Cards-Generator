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
        
        <div class="card" v-if="previewCard">
          <div class=frontbg>
            {{preview.word}}
            <div class=hira>
              {{preview.reading}}
            </div>
          </div>
          <div class=backbg>
            <div class=wordtype>
              〔{{preview.wordType}}〕
            </div>
            <div class=defbg>
              {{preview.Definition}}
            </div>
            <div class=sentence v-html="preview.Sentences"></div>
            <div class=others v-html="preview.Others"></div>
          </div>
        </div>
    </v-app>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { ankiFields, previewCard } from '../types/generator';
  import { Tab, Alert } from '../enums/generator';
  import openAi from '../methods/openai';
  import anki from '../methods/anki';

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
  const preview = ref<previewCard>({
    word: 'Example',
    wordType: 'Noun',
    reading: '範例',
    Definition: 'An example is something that is used to demonstrate or represent a larger concept.',
    Sentences: 'This is an example sentence. <br> 這是一個例句。',
    Others: 'Other information',
  });
  const previewCard = ref(false);

  const setAlert = (type: Alert, message?: string): void => {
    alertStatus.value = type;
    messages.value = message ? message : (type === Alert.Success) ? 'The card has been generated successfully' : 'Error when generating the card';

    setTimeout(() => {
      alertStatus.value = Alert.None;
      messages.value = '';
    }, 5000);
  };

  const setPreviewCard =  (fields: ankiFields): void => {

    preview.value = {
      word: fields.Word,
      wordType: fields["Word Type"],
      reading: fields.Reading,
      Definition: fields.Definition,
      Sentences: fields["Sentence(s)"],
      Others: fields["Other(s)"],
    };

    previewCard.value = true;
  };

  const generate = async () => {
    submit.value = true;

    try {

        const fields = await openAi(inputText.value, tab.value);

        setPreviewCard(fields);

        const createdData = await anki.createCard(fields);

        if (createdData.error === 'cannot create note because it is a duplicate') {
          const findCardData = await anki.findCard(fields.Word);

          if (findCardData.error || findCardData.result.length === 0) {
              throw new Error(findCardData.error);
          }

          const updateCardData = await anki.updateCard(fields, findCardData.result[0]);

          if (updateCardData.error) {
              throw new Error(updateCardData.error);
          }
        }
        setAlert(Alert.Success, 'The card has been generated successfully');
        submit.value = false;
    } catch (error) {
        setAlert(Alert.Error);
        submit.value = false;
    }
  };
  </script>

<style lang="scss">
// Template 
.card {
 font-family: Noto Sans CJK JP Regular;
 font-size: 50px;
 text-align: center;
 color: black;
 background: url("bg.jpg");
}
 
.android .card {
 font-family: Noto Sans CJK JP Regular;
 font-size: 30px;
 text-align: center;
 color: black;
 background: url("bg.jpg");
}
 
.frontbg {
 background-color: #18adab;
 border-radius: 7px;
 color: #fff;
 position: relative;
 left: 0;
}
 
.engdefbg {
 font-family: Raleway;
 font-style: italic;
 padding: 15px;
 margin-left: -5px;
 margin-top: -15px;
 color: #18adab;
 font-size: 15px;
}
 
.android .engdefbg {
 font-family: Raleway;
 font-style: italic;
 padding: 15px;
 margin-left: -15px;
 margin-top: -20px;
 color: #18adab;
 font-size: 10px;
}
 
.others {
 position: relative;
 top: 15px;
 border: 1px dotted #72c8e1;
 color: #18adab;
 font-size: 20px;
 width: auto;
 padding-top: 15px;
 padding-left: 20px;
 padding-bottom: 15px;
 padding-right: 20px;
 margin-bottom: 35px;
}
 
.android .others {
 position: relative;
 top: 10px;
 border: 1px dotted #72c8e1;
 color: #18adab;
 font-size: 17px;
 width: auto;
 padding-top: 8px;
 padding-left: 15px;
 padding-bottom: 8px;
 padding-right: 15px;
 margin-bottom: 20px;
}

.wordtype {
 font-size: 15px;
 margin-top: -10px;
 margin-bottom: 20px;
}

.defbg {
 font-size: 20px;
 margin-bottom: 20px;
}
 
.sentence {
 font-size: 20px;
 margin-top: -20px;
 margin-bottom: 5px;
}
 
.android .sentence {
 font-size: 17px;
 margin-top: -15px;
}
 
.backbg {
 position: relative;
 top: -3px;
 background-color: #fff;
 padding: 15px;
 padding-bottom: 15px;
 padding-left: 30px;
 padding-right: 30px;
 border-radius: 0px 0px 10px 10px; 
 color: #016ea6;
 font-size: 28px;
 text-align: left;
}
 
.android .backbg {
 position: relative;
 top: -5px;
 background-color: #fff;
 padding: 15px;
 padding-bottom: 15px;
 padding-left: 15px;
 padding-right: 15px;
 border-radius: 0px 0px 10px 10px; 
 color: #016ea6;
 font-size: 20px;
 text-align: left;
}
 
.hira {
 font-size: 25px;
 line-height: 5px;
 padding-bottom: 40px;
}
 
.android .hira {
 font-size: 18px;
 line-height: 5px;
 padding-bottom: 25px;
}
 
hr {
 height: 2px;
 font-size: 30px;
 border: 0;
 background: #72c8e1;
}
 
u {
 text-decoration: none;
 border-bottom: 1px dotted;
}
 
</style>
  