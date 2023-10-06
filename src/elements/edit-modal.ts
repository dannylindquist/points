import { define, on } from "../lib/bind";
import { store } from "../playerStore";

define('points-edit-modal', ({ el, refs }) => {
    const { dialog, wrapper, closeButton, changeForm } = refs;
  
    on(dialog, 'click', event => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (
        !wrapper.contains(
          event.target
        ) &&
        (dialog as HTMLDialogElement).open
      ) {
        (dialog as HTMLDialogElement).close()
      }
    })
  
    on(closeButton, 'click', () => {
      (dialog as HTMLDialogElement).close()
    })
  
    on(changeForm,"submit", (event) => {
        event.preventDefault();
        // @ts-ignore it works
        const action = event.submitter!.value;
        const data = new FormData(event.target as HTMLFormElement);
        let score = +(data.get("score-change") || 0);
        if (action === "subtract") {
          score *= -1;
        }
        const playerId = data.get("playerId");
        const items = [...store.players.value];
        const foundPlayer = items.find((item) => item.id == playerId);
        if (foundPlayer) {
          foundPlayer.score += +(score ?? 0);
          store.players.value = items;
          (event.target as HTMLFormElement).reset();
          (dialog as HTMLDialogElement).close();
        }
      });
  })