  import axios from "axios";
  import { ankiBody, ankiFields, ankiResponse } from "../types/generator";

  const ANKI_URL = import.meta.env.VITE_ANKI_URL;

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

          return response.data;
      } catch (error: any) {
          throw new Error(error);
      }
  };


  export default {
    createCard,
    findCard,
    updateCard,
  };
