<template>
  <v-main>
      <name-header />
      <v-container fluid class="bg-white h-100">
        <v-alert v-if="config.status === 'success'" :text="config.message" type="success"></v-alert>
        <v-alert v-if="config.status === 'error'" :text="config.message" type="error"></v-alert>

        <v-tabs
          v-model="config.keywordType"
          bg-color="primary"
        >
          <v-tab value="1">Word</v-tab>
          <v-tab value="2">Copy from Dictionary</v-tab>
        </v-tabs>

        <v-sheet class="mx-auto" color="white">
            <v-form @submit.prevent="generate">
              <v-text-field
                  v-if="config.keywordType === '1'"
                  v-model="promptConfig.keyword"
                  :rules="rules"
                  label="Word"
                  placeholder="Please enter a word"
                  outlined
                  hide-details
              />
              <v-textarea
                v-else label="Copy from Dictionary"
                :rules="rules"
                v-model="promptConfig.keyword"
                hide-details
                outlined
              ></v-textarea>

              <v-card-actions @click="config.showOption = !config.showOption" class="bg-grey-darken-4 cursor-pointer">
                <v-btn
                  color="white"
                  text
                >
                  Prompt Setting
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn
                  icon
                >
                  <v-icon>{{ config.showOption ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </v-card-actions>

              <v-expand-transition>
                <div v-show="config.showOption">

                  <v-tabs
                    v-model="config.promptType"
                    bg-color="grey-darken-4"
                  >
                    <v-tab value="1">Default</v-tab>
                    <v-tab value="2">Customize</v-tab>
                  </v-tabs>

                  <v-textarea
                    v-model="promptConfig.message"
                    label="Prompt message"
                    :disabled="config.promptType === '1'"
                    auto-grow
                    hide-details
                  />

                  <v-container
                    style="min-width: 100%"
                    class="bg-grey-darken-4 ma-0"
                    outlined
                    text
                  >
                    <h4>
                      Json Fields
                    </h4>
                  </v-container>
                  <v-table>
                    <thead>
                      <tr>
                        <th class="text-left">
                          Key
                        </th>
                        <th class="text-left">
                          Type
                        </th>
                        <th class="text-left">
                          More Info
                        </th>
                      </tr>
                      <th class="text-left">
                      </th>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(field, i) in promptConfig.jsonFields"
                        :key="`fields_${i}`"
                      >
                        <td
                          style="width: 25%"
                        >
                          <v-text-field
                              v-model="promptConfig.jsonFields[i].key"
                              :rules="rules"
                              :placeholder="'Please fill the field key'"
                              outlined
                              hide-details
                          />
                        </td>
                        <td
                          style="width: 25%"
                        >
                          <v-select
                            v-model="promptConfig.jsonFields[i].type"
                            :items="Object.values(JsonTypes)"
                            outlined
                            hide-details
                          />
                        </td>
                        <td
                          style="width: 25%"
                        >
                          <v-text-field
                              v-model="promptConfig.jsonFields[i].info"
                              :rules="rules"
                              :placeholder="'Please fill the field more info'"
                              outlined
                              hide-details
                          />
                        </td>
                        <td
                          style="width: 2%"
                        >
                          <v-icon
                            :icon="'mdi-delete'"
                            @click="removeField(i)"
                            class="cursor-pointer"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                  <v-btn
                    @click="addField"
                    color="bg-grey-darken-4"
                    block
                  >
                    Add Key
                  </v-btn>
                  <v-container
                    style="min-width: 100%"
                    class="bg-grey-darken-4 ma-0"
                    outlined
                    text
                  >
                    <h4>
                      Preview card template
                    </h4>
                  </v-container>
                  <v-switch
                    color="black"
                    v-model="preview.show"
                    label="Show Preview Template"
                  >
                  </v-switch>
                  <v-textarea
                      v-model="preview.template"
                      label="Card Template"
                      auto-grow
                      hide-details
                  />
                </div>
              </v-expand-transition>

              <div class="d-flex justify-end mt-5">
                  <v-btn
                    :loading="config.status === 'submitting'"
                    :disabled="!promptConfig.keyword || config.status === 'submitting'"
                    color="primary"
                    type="submit"
                    block
                    size="x-large"
                  >
                    Generate
                  </v-btn>
              </div>
            </v-form>
        </v-sheet>

        <div
          class="mt-5"
          v-if="preview.show && computedPreview"
          v-html="computedPreview" >
        </div>

        <div v-if="preview.card">
          <v-btn
            color="#18adab"
            block
            size="x-large"
            @click="downloadJson"
          >
            Download Anki Json Fields
          </v-btn>
        </div>
      </v-container>
  </v-main>
</template>
  
  <script setup lang="ts">
  import { reactive, watch, computed, onMounted } from 'vue';
  import { SpanlishPromptMessage, EnglishPromptMessage } from '../classes/prompt-message';
  import { generatorConfig, previewCardConfig, prompt } from '../types/generator';
  import { PromptType, KeywordType, Status, JsonTypes, Languages } from '../enums/generator';
  import openAi from '../methods/openai';
  import anki from '../methods/anki';
  import { getLang } from '../methods/lang';

  const rules = [
    (value?: string) => {
      if (value) {
        return true;
      }

      return 'You must enter a word';
    },
  ];

  onMounted(() => {
    config.language = getLang();
  });

  /* Generator Config */
  const config = reactive<generatorConfig>({
      keywordType: KeywordType.Word,
      promptType: PromptType.Default,
      status: Status.None,
      message: null,
      showOption: false,
      language: Languages.En,
  });
  watch([config], () => {
    promptConfig.message = getPromptMessage();
  });
  /* prompt */
  const getPromptMessage = (): string => {
    if (config.promptType === PromptType.Customize) {
      return promptConfig.message;
    }

    const promptMessage = (() => {
      if (config.language === Languages.Es) {
        return new SpanlishPromptMessage(config.keywordType);
      }

      return new EnglishPromptMessage(config.keywordType);
    });

    return promptMessage().getMessage();
  };
  const addField = (): void => {
    promptConfig.jsonFields.push({ key: '', type: JsonTypes.String, info: '' });
  };
  const removeField = (index: number): void => {
    if (promptConfig.jsonFields.length === 1) {
      return;
    }

    promptConfig.jsonFields.splice(index, 1);
  };
  const promptConfig = reactive<prompt>({
    keyword: '',
    message: getPromptMessage(),
    jsonFields: [
      {
        key: 'Word',
        type: JsonTypes.String,
        info: null,
      },
      {
        key: 'Word Type',
        type: JsonTypes.String,
        info: null,
      },
      {
        key: 'Reading',
        type: JsonTypes.String,
        info: "It\'s the word translated to Chinese Traditional. If the word translate has multiple meanings and definitions, please separate them by character '|'",
      },
      {
        key: 'Definition',
        type: JsonTypes.String,
        info: 'It\'s the definition of the word. If the word translate has multiple meanings and definitions, please separate them by number and separate line by <br />'
      },
      {
        key: 'Sentence(s)',
        type: JsonTypes.StringToHtml,
        info: `Wrap each example with <br> tag. If the word translate has multiple meanings and definitions, please paste all sentences to here. Example: She did a test to see how well the students could pronounce the English words. Please includes every sentence with Chinese traditional translate. For Example: \`\`\`1. She did a test to see how well the students could pronounce the English words.
        <br> 她做了一個測試，看看學生們能否發音英文單字。 <br> 2. He did a test to see how well the students could pronounce the English words. <br> 他做了一個測試，看看學生們能否發音英文單字。 3. They did a test to see how well the students could pronounce the English words. <br> 他們做了一個測試，看看學生們能否發音英文單字。 \`\`\``,
      },
      {
        key: 'Other(s)',
        type: JsonTypes.String,
        info: null,
      },
    ]
  });

  /* Preview Card */
  const preview = reactive<previewCardConfig>({
    template: `<div class="card">
          <div class=frontbg>
            {{Word}}
            <div class=hira>
              {{Reading}}
            </div>
          </div>
          <div class=backbg>
            <div class=wordtype>
              〔{{Word Type}}〕
            </div>
            <div class=defbg>
              {{Definition}}
            </div>
            <div class=sentence>
              {{Sentence(s)}}
            </div>
            <div class=others>
              {{Other(s)}}
            </div>
          </div>
        </div>`,
    card: null,
    show: true,
  });
  const computedPreview = computed(() => {
    if (!preview.show || !preview.card) {
      return null;
    }

    let template = preview.template;
    let allKeys = Object.keys(preview.card);
    allKeys.forEach((key) => {
      let escapedKey = key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
      let regexp = new RegExp('{{\\s*' + escapedKey + '\\s*}}', 'gi');
      template = template.replace(regexp, preview.card[key]);
    });

    return template;
  });
  const downloadJson = () => {
    const data = JSON.stringify(preview.card, null, 2);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = preview.card['Word'] ? preview.card['Word'] + '.json' : 'anki-fields' + '.json';
    a.click();
  }

  /* Generator */
  const formatMessage = (): string => {
    return `\`\`\`${promptConfig.keyword}\`\`\`\n` + promptConfig.message;
  };
  const formatJsonFieldsToString = (): string => {
    return "```\n" + promptConfig.jsonFields.map((field) => {
      return `${field.key}: ${field.type} ${field.info ? `(${field.info})` : ''}`;
    }).join('\n') + "```";
  };
  const getFinalPrompt = (): string => {
    return formatMessage() + formatJsonFieldsToString();
  };
  const setAlert = (type: Status, message?: string): void => {
    config.status = type;
    config.message = message ? message : (type === Status.Success) ? 'The card has been generated successfully' : 'Error when generating the card';

    setTimeout(() => {
      config.status = Status.None;
      config.message = '';
    }, 5000);
  };
  const generate = async () => {
    config.status = Status.Submitting;

    try {
        preview.card = null;

        const fields = await openAi.getFieldsFromOpenAi(getFinalPrompt());

        preview.card = fields;

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

        if (createdData.error) {
          throw new Error(createdData.error);
        }

        setAlert(Status.Success, 'The card has been generated successfully');
    } catch (error) {
        setAlert(Status.Error);
    }
    config.status = Status.None;
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
  