import { define, on } from "../lib/bind";
import { store } from "../playerStore";

define('player-add-form', ({ refs }) => {
    const { form } = refs;
  
    on(form, 'submit', (event) => {
      event.preventDefault();
      if (!(event.target instanceof HTMLFormElement)) {
        return;
      }
      const data = new FormData(event.target);
      const name = data.get("name");
  
      if (typeof name === "string") {
        store.addPlayer(name);
      }
  
      event.target.reset();
    });
  });