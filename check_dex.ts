import { Dex } from '@pkmn/dex';

const items = Array.from(Dex.items.all()).slice(0, 5);
console.log('Items:', items.map(i => i.name));

const moves = Array.from(Dex.moves.all()).slice(0, 5);
console.log('Moves:', moves.map(m => m.name));

const abilities = Array.from(Dex.abilities.all()).slice(0, 5);
console.log('Abilities:', abilities.map(a => a.name));
