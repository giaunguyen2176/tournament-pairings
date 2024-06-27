import { shuffle } from './Shuffle.js';
export function Stepladder(players, startingRound = 1, ordered = true) {
    const matches = [];
    let playerArray = [];
    if (Array.isArray(players)) {
        playerArray = ordered ? players : shuffle(players);
    }
    else {
        playerArray = [...new Array(players)].map((_, i) => i + 1);
    }
    const rounds = playerArray.length - 1;
    for (let i = startingRound; i < startingRound + rounds; i++) {
        const match = {
            round: i,
            match: 1,
            player1: playerArray[playerArray.length - (i - startingRound) - 2],
            player2: i === startingRound ? playerArray[playerArray.length - (i - startingRound) - 1] : null
        };
        if (i < startingRound + rounds - 1) {
            match.win = {
                round: i + 1,
                match: 1
            };
        }
        matches.push(match);
    }
    return matches;
}
//# sourceMappingURL=Stepladder.js.map