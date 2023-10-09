import { define, onSubmit } from "../lib/bind";

define("points-player-add", ({ refs }) => {
  const { form } = refs as { form: HTMLFormElement };

  onSubmit(form as HTMLFormElement, (values, event) => {
    event.preventDefault();
    const name = values["name"];
    if (typeof name === "string") {
      form.dispatchEvent(
        new CustomEvent("app:add-player", { detail: name, bubbles: true })
      );
    }
    form.reset();
  });
});
