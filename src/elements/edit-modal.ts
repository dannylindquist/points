import {
  define,
  on,
  onCustomEvent,
  onSubmit,
  signal,
  watch,
} from "../lib/bind";
import { Player } from "../playerStore";

define("points-edit-modal", ({ refs }) => {
  const {
    dialog,
    wrapper,
    closeButton,
    changeForm,
    name,
    playerId,
    removePlayer,
  } = refs;
  const editingPlayer = signal<Player | null>(null);

  on(dialog, "click", (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    if (!wrapper.contains(event.target) && (dialog as HTMLDialogElement).open) {
      (dialog as HTMLDialogElement).close();
    }
  });

  watch(() => {
    const value = editingPlayer.value;
    if (value) {
      (playerId as HTMLInputElement).value = value.id;
      name.textContent = value.name;
    }
  });

  on(closeButton, "click", () => {
    (dialog as HTMLDialogElement).close();
  });

  onCustomEvent<Player>("app:edit-player", (event) => {
    editingPlayer.value = event.detail;
    (dialog as HTMLDialogElement).showModal();
  });

  onSubmit(changeForm as HTMLFormElement, (values, event) => {
    event.preventDefault();
    // @ts-ignore it works
    const action = event.submitter!.value;
    let score = +(values["score-change"] || 0);
    if (action === "subtract") {
      score *= -1;
    }
    const playerId = values["playerId"];
    changeForm.dispatchEvent(
      new CustomEvent("app:update-score", {
        detail: {
          playerId: playerId,
          scoreChange: score,
        },
        bubbles: true,
      })
    );
    (event.target as HTMLFormElement).reset();
    (dialog as HTMLDialogElement).close();
  });

  on(removePlayer, "click", () => {
    if (editingPlayer.value) {
      removePlayer.dispatchEvent(
        new CustomEvent("app:remove-player", {
          detail: editingPlayer.value?.id,
          bubbles: true,
        })
      );
      (dialog as HTMLDialogElement).close();
    }
  });
});
