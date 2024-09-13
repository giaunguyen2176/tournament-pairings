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
    for (let i = 0; i < playerArray.length; i++) {
        const curr = playerArray[i];
        const next = playerArray.slice(i + 1);
        const sorted = rated
            ? [...next].sort((a, b) => Math.abs(curr.rating - a.rating) -
                Math.abs(curr.rating - b.rating))
            : [];
        // sort rank from high to low
        const reversedScoreGroups = [...scoreGroups].reverse();
        // find higher score groups
        const higherScoreGroups = reversedScoreGroups.filter((sg) => sg > curr.score);
        console.debug("higherScoreGroups", higherScoreGroups);
        // if above score groups have an even number of players
        // it's highly likely that they can be paired up nicely
        // so set a threshold to exclude those score groups from effecting weight
        // for initial, use 999 to not exclude anything
        let upperThreshold = 999;
        let upperSum = 0;
        for (let k = 0; k < higherScoreGroups.length; k++) {
            const sg = reversedScoreGroups[k];
            const count = playerArray.filter((p) => p.score === sg).length;
            upperSum += count;
            if (upperSum % 2 === 0) {
                upperThreshold = sg;
                if (sg > higherScoreGroups.at(-1)) {
                    upperSum = 0;
                }
            }
        }
        // count the players of score groups below the threshold
        const belowThresholdScoreGroups = scoreGroups.filter((sg) => sg >= curr.score && sg < upperThreshold);
        const playerCount = belowThresholdScoreGroups.reduce((count, sg) => {
            count = count + scoreGroupPlayers[sg].length;
            return count;
        }, 0);
        console.debug("score, upperThreshold, playerCount", curr.score, upperThreshold, playerCount);
        for (let j = 0; j < next.length; j++) {
            const opp = next[j];
            if (curr.hasOwnProperty("avoid") && curr.avoid.includes(opp.id)) {
                continue;
            }
            // prioritize pair with higher total score
            let wt = 14 * Math.log10(scoreSums.findIndex((s) => s === curr.score + opp.score) + 1);
            // prioritize scoreGroupDiff < 2, over scoreGroupDiff >= 2
            const scoreGroupDiff = Math.abs(scoreGroups.findIndex((s) => s === curr.score) -
                scoreGroups.findIndex((s) => s === opp.score));
            if (scoreGroupDiff < 2) {
                // basically prioritize pairs with closer scores (maximum different rank is 0 or 1)
                if (scoreGroupDiff === 0) {
                    // same score group
                    if (scoreGroupPlayers[curr.score].length >= 3) {
                        // if group has many players, prioritize within the same score group first
                        wt += (4 + (1 / Math.log10(j + 2))) / Math.log10(scoreGroupDiff + 2);
                    }
                    else {
                        wt += 3 / Math.log10(scoreGroupDiff + 2);
                    }
                }
                else {
                    // different score group, but distance is only 1
                    if (playerCount % 2 === 0) {
                        // number of players is even
                        if (playerCount === 2) {
                            // there is exactly 2 players in these score groups
                            // if the 2 players have already played each other
                            // then, prioritize to match current player with player in a differernt rank
                            // and because players are sorted from high score to low score
                            // that mean to prioritize to match current player with player in lower rank
                            if (!scoreGroupPlayers[curr.score] ||
                                scoreGroupPlayers[curr.score].length < 2) {
                                wt += 2 / Math.log10(scoreGroupDiff + 2);
                            }
                            else {
                                const player1 = scoreGroupPlayers[curr.score][0];
                                const player2 = scoreGroupPlayers[curr.score][1];
                                if (player1.avoid.includes(player2.id)) {
                                    wt += 5 / Math.log10(scoreGroupDiff + 2);
                                }
                                else {
                                    wt += 2 / Math.log10(scoreGroupDiff + 2);
                                }
                            }
                        }
                        else {
                            wt += 2 / Math.log10(scoreGroupDiff + 2);
                        }
                    }
                    else {
                        // if number of players is odd
                        // prioritize pairs with different score (shifting to next group)
                        wt += 5 / Math.log10(scoreGroupDiff + 2);
                    }
                }
            }
            else if (scoreGroupDiff < 3) {
                // different rank is 2
                const players = playerArray
                    .filter((p) => p.score > opp.score && p.score <= curr.score)
                    .map((p) => p.id);
                const pairable = players.find((id) => id !== curr.id && !curr.avoid.includes(id));
                if (pairable) {
                    wt += Math.log10(scoreGroupDiff + 2);
                }
                else {
                    // if can not pair with anyone between curr.score & opp.score, prioritize it more
                    wt += 6 / Math.log10(scoreGroupDiff + 2);
                }
            }
            else {
                // do not allow pairs with different rank >= 3
                continue;
            }
            if (scoreGroupDiff === 1 &&
                curr.hasOwnProperty("pairedUpDown") &&
                curr.pairedUpDown === false &&
                opp.hasOwnProperty("pairedUpDown") &&
                opp.pairedUpDown === false) {
                wt += 1.2;
            }
            if (rated) {
                wt +=
                    (Math.log2(sorted.length) -
                        Math.log2(sorted.findIndex((p) => p.id === opp.id) + 1)) /
                        3;
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
            }
            if ((curr.hasOwnProperty("receivedBye") && curr.receivedBye) ||
                (opp.hasOwnProperty("receivedBye") && opp.receivedBye)) {
                wt *= 1.5;
            }
            pairs.push([curr.index, opp.index, wt]);
        }
    }
    if (pairs.length === 0) {
        return [];
    }
    const blossomPairs = blossom(pairs, true);
    console.log("pairings input players", playerArray);
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