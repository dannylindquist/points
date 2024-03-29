import { Signal, effect, signal } from "@preact/signals-core";
import { get, set } from "idb-keyval";

export type Player = {
  name: string;
  id: string;
  score: number;
};

function createPlayer(name: string) {
  return {
    name,
    id: Math.random().toString(32).substring(2),
    score: 0,
  };
}

export class PlayerStore {
  players: Signal<Player[]>;

  constructor(initialValue?: Player[]) {
    this.players = signal<Player[]>(initialValue ?? []);
  }

  async init() {
    this.players.value = (await get("playerList")) || [];
    effect(() => {
      set("playerList", this.players.value);
    });
  }

  get value() {
    return this.players.value;
  }

  clear() {
    this.players.value = [];
  }

  addPlayer(name: string) {
    this.players.value = [...this.players.value, createPlayer(name)];
  }

  removePlayer(id: string) {
    const players = [...this.players.value].filter(
      (player) => player.id !== id
    );
    this.players.value = players;
  }
}
