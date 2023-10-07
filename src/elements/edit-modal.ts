import { define, on, onCustomEvent, signal, text, watch } from "../lib/bind";
import { Player, store } from "../playerStore";

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

  text(name, () => editingPlayer.value?.name ?? "");
  watch(() => {
    const value = editingPlayer.value;
    if (value) {
      (playerId as HTMLInputElement).value = value.id;
    }
  });

  on(closeButton, "click", () => {
    (dialog as HTMLDialogElement).close();
  });

  onCustomEvent<Player>("app:edit-player", (event) => {
    editingPlayer.value = event.detail;
    (dialog as HTMLDialogElement).showModal();
  });

  on(changeForm, "submit", (event) => {
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

  on(removePlayer, "click", () => {
    if (editingPlayer.value) {
      store.removePlayer(editingPlayer.value?.id);
      (dialog as HTMLDialogElement).close();
    }
  });
});
