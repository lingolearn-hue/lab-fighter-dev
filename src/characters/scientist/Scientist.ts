import { Character, type CharacterEvents } from "../../core/character/Character";
import { SCIENTIST_ATTACKS } from "./attacks";

export function createScientist(name: string, events: CharacterEvents = {}): Character {
  const character = new Character(name, events);
  character.attacks = SCIENTIST_ATTACKS;
  return character;
}
