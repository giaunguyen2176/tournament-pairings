import blossom from 'edmonds-blossom-fixed';
export function Swiss(players, round, rated = false, colors = false) {
    const matches = [];
    let playerArray = [];
    if (Array.isArray(players)) {
        playerArray = players;
    }
    else {
        playerArray = [...new Array(players)].map((_, i) => i + 1);
    }
    if (rated) {
        playerArray.filter(p => !p.hasOwnProperty('rating') || p.rating === null).forEach(p => p.rating = 0);
    }
    if (colors) {
        playerArray.filter(p => !p.hasOwnProperty('colors')).forEach(p => p.colors = []);
    }
    playerArray.forEach((p, i) => p.index = i);
    const scoreGroups = [...new Set(playerArray.map(p => p.score))].sort((a, b) => a - b);
    const scoreSums = [...new Set(scoreGroups.map((s, i, a) => {
            let sums = [];
            for (let j = i; j < a.length; j++) {
                sums.push(s + a[j]);
            }
            return sums;
        }).flat())].sort((a, b) => a - b);
    const scoreGroupPlayers = scoreGroups.reduce((sgps, sg) => {
        sgps[sg] = playerArray.filter((p) => p.score === sg);
        return sgps;
    }, {});
    console.log("score sums", scoreSums);
    console.log("score groups", scoreGroups);
    console.log("scoreGroupPlayers", scoreGroupPlayers);
    let pairs = [];
    let debugPairs = [];
    for (let i = 0; i < playerArray.length; i++) {
        const curr = playerArray[i];
        const next = playerArray.slice(i + 1);
        const sorted = rated
            ? [...next].sort((a, b) => Math.abs(curr.rating - a.rating) -
                Math.abs(curr.rating - b.rating))
            : [];
        // sort rank from high to low
        const reversedScoreGroups = [...scoreGroups].reverse();
        let evenHighThreshold = 999;
        let evenLowThreshold = 0;
        let slicePlayers = [];
        for (let k = 0; k < reversedScoreGroups.length; k++) {
            const sg = reversedScoreGroups[k];
            slicePlayers = [...slicePlayers, ...scoreGroupPlayers[sg]];
            if (slicePlayers.length % 2 === 0) {
                if (slicePlayers.length === 2) {
                    const p1 = slicePlayers[0];
                    const p2 = slicePlayers[1];
                    if (p1.avoid.includes(p2.id)) {
                        continue;
                    }
                }
                if (sg > curr.score) {
                    evenHighThreshold = sg;
                    slicePlayers = [];
                    continue;
                }
                evenLowThreshold = sg;
                break;
            }
        }
        console.debug("score, evenHighThreshold, evenLowThreshold, evenSlicePlayerCount", curr.score, evenHighThreshold, evenLowThreshold, slicePlayers.length);
        const evenSlicePlayers = playerArray.filter((p) => p.score < evenHighThreshold && p.score >= evenLowThreshold);
        console.log("evenSlicePlayers", evenSlicePlayers);
        const halfway = evenSlicePlayers.length / 2;
        for (let j = 0; j < next.length; j++) {
            const opp = next[j];
            if (curr.hasOwnProperty("avoid") && curr.avoid.includes(opp.id)) {
                continue;
            }
            let debugWt = [];
            // prioritize pair with higher total score
            const scoreSumIndex = scoreSums.findIndex((s) => s === curr.score + opp.score);
            let wt = 14 * Math.log10(scoreSumIndex + 1);
            debugWt.push(['score', wt]);
            const isSameSlice = evenSlicePlayers.find((p) => p.id === opp.id);
            const currIndex = evenSlicePlayers.findIndex((p) => p.id === curr.id);
            const oppIndex = evenSlicePlayers.findIndex((p) => p.id === opp.id);
            if (isSameSlice) {
                if (currIndex < halfway && oppIndex >= halfway) {
                    const indexDiff = oppIndex - currIndex - halfway;
                    if (indexDiff >= -1) {
                        wt += 5 / Math.log10(currIndex + oppIndex + 3);
                    }
                    else {
                        wt += 1 / Math.log10(2);
                    }
                    debugWt.push([
                        "halfway",
                        wt,
                        oppIndex,
                        currIndex,
                        halfway,
                        indexDiff,
                    ]);
                }
                else {
                    debugWt.push(["same half", wt, oppIndex, currIndex, halfway]);
                }
                if (colors) {
                    const colorScore = curr.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
                    const oppScore = opp.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
                    if (curr.colors.length > 1 &&
                        curr.colors.slice(-2).join("") === "ww") {
                        if (opp.colors.slice(-2).join("") === "ww") {
                            continue;
                        }
                        else if (opp.colors.slice(-2).join("") === "bb") {
                            wt += 7;
                        }
                        else {
                            wt += 2 / Math.log(4 - Math.abs(oppScore));
                        }
                    }
                    else if (curr.colors.length > 1 &&
                        curr.colors.slice(-2).join("") === "bb") {
                        if (opp.colors.slice(-2).join("") === "bb") {
                            continue;
                        }
                        else if (opp.colors.slice(-2).join("") === "ww") {
                            wt += 8;
                        }
                        else {
                            wt += 2 / Math.log(4 - Math.abs(oppScore));
                        }
                    }
                    else {
                        wt += 5 / (4 * Math.log10(10 - Math.abs(colorScore - oppScore)));
                    }
                    debugWt.push(["colors", wt]);
                }
            }
            else {
                debugWt.push([
                    "not same slice",
                    wt,
                    oppIndex,
                    currIndex,
                    halfway,
                ]);
            }
            if (rated) {
                wt +=
                    (Math.log2(sorted.length) -
                        Math.log2(sorted.findIndex((p) => p.id === opp.id) + 1)) /
                        3;
                debugWt.push(["rated", wt]);
            }
            if (opp.hasOwnProperty("receivedBye") && opp.receivedBye) {
                const currGroupIndex = scoreGroups.findIndex((s) => s === curr.score);
                const oppGroupIndex = scoreGroups.findIndex((s) => s === opp.score);
                const scoreGroupDiff = Math.abs(currGroupIndex - oppGroupIndex);
                if (oppGroupIndex < 2) {
                    if (scoreGroupDiff < 2) {
                        wt += 3 / Math.log10(scoreGroupDiff + 2);
                        debugWt.push(["bye with low diff", wt]);
                    }
                    else {
                        wt += 5 / Math.log10(scoreGroupDiff + 2);
                        debugWt.push(["bye with high diff", wt]);
                    }
                }
            }
            pairs.push([curr.index, opp.index, wt]);
            debugPairs.push([curr.index, opp.index, wt, debugWt]);
        }
    }
    if (pairs.length === 0) {
        return [];
    }
    const blossomPairs = blossom(pairs, true);
    console.log("pairings input players", playerArray);
    console.log("debug pairings pairs", debugPairs);
    console.log("pairings pairs", pairs);
    console.log("blossomPairs", blossomPairs);
    let playerCopy = [...playerArray];
    let byeArray = [];
    let match = 1;
    do {
        const indexA = playerCopy[0].index;
        const indexB = blossomPairs[indexA];
        if (indexB === -1) {
            byeArray.push(playerCopy.splice(0, 1)[0]);
            continue;
        }
        playerCopy.splice(0, 1);
        playerCopy.splice(playerCopy.findIndex(p => p.index === indexB), 1);
        let playerA = playerArray.find(p => p.index === indexA);
        let playerB = playerArray.find(p => p.index === indexB);
        if (colors) {
            const aScore = playerA.colors.reduce((sum, color) => color === 'w' ? sum + 1 : sum - 1, 0);
            const bScore = playerB.colors.reduce((sum, color) => color === 'w' ? sum + 1 : sum - 1, 0);
            if (playerB.colors.slice(-2).join('') === 'bb' ||
                playerA.colors.slice(-2).join('') === 'ww' ||
                (playerB.colors.slice(-1) === 'b' && playerA.colors.slice(-1) === 'w') ||
                bScore < aScore) {
                [playerA, playerB] = [playerB, playerA];
            }
        }
        matches.push({
            round: round,
            match: match++,
            player1: playerA.id,
            player2: playerB.id
        });
    } while (playerCopy.length > blossomPairs.reduce((sum, idx) => idx === -1 ? sum + 1 : sum, 0));
    byeArray = [...byeArray, ...playerCopy];
    for (let i = 0; i < byeArray.length; i++) {
        matches.push({
            round: round,
            match: match++,
            player1: byeArray[i].id,
            player2: null
        });
    }
    return matches;
}
//# sourceMappingURL=Swiss.js.map