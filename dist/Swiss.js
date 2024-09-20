import blossom from "edmonds-blossom-fixed";
function findFloaters(players) {
    var _a, _b, _c, _d;
    if (players.length === 0) {
        return [];
    }
    if (players.length === 1) {
        return players;
    }
    const floaters = [];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const others = players.filter((p) => p.id !== player.id);
        const pairable = others.find((p) => { var _a; return !((_a = p.avoid) === null || _a === void 0 ? void 0 : _a.includes(player.id)); });
        if (!pairable) {
            floaters.push([player, pairable]);
            continue;
        }
        const currScore = (_b = (_a = player.colors) === null || _a === void 0 ? void 0 : _a.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0)) !== null && _b !== void 0 ? _b : 0;
        const pairableByColorScore = others.find((p) => {
            var _a, _b;
            const oppScore = (_b = (_a = p.colors) === null || _a === void 0 ? void 0 : _a.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0)) !== null && _b !== void 0 ? _b : 0;
            return Math.abs(currScore + oppScore) !== 4;
        });
        if (!pairableByColorScore) {
            floaters.push([player, pairableByColorScore]);
            continue;
        }
        const currColors = (_d = (_c = player.colors) === null || _c === void 0 ? void 0 : _c.slice(-2).join("")) !== null && _d !== void 0 ? _d : '';
        if (currColors === 'ww' || currColors === 'bb') {
            const pairableByColor = others.find((p) => {
                var _a, _b;
                const oppColors = (_b = (_a = p.colors) === null || _a === void 0 ? void 0 : _a.slice(-2).join("")) !== null && _b !== void 0 ? _b : '';
                return ((currColors === "ww" && oppColors !== "ww") ||
                    (currColors === "bb" && oppColors !== "bb"));
            });
            if (!pairableByColor) {
                floaters.push([player, pairableByColor]);
                continue;
            }
        }
    }
    const remain = players.filter((p) => !floaters.map((p1) => p1.id).includes(p.id));
    if (remain.length % 2 === 0) {
        return floaters;
    }
    const middle = remain[Math.floor(remain.length / 2)];
    if (middle) {
        floaters.push([middle, remain]);
    }
    return floaters;
}
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
        playerArray
            .filter((p) => !p.hasOwnProperty("rating") || p.rating === null)
            .forEach((p) => (p.rating = 0));
    }
    if (colors) {
        playerArray
            .filter((p) => !p.hasOwnProperty("colors"))
            .forEach((p) => (p.colors = []));
    }
    playerArray.forEach((p, i) => (p.index = i));
    const scoreGroups = [...new Set(playerArray.map((p) => p.score))].sort((a, b) => a - b);
    const scoreSums = [
        ...new Set(scoreGroups
            .map((s, i, a) => {
            let sums = [];
            for (let j = i; j < a.length; j++) {
                sums.push(s + a[j]);
            }
            return sums;
        })
            .flat()),
    ].sort((a, b) => a - b);
    const scoreGroupPlayers = scoreGroups.reduce((sgps, sg) => {
        sgps[sg] = playerArray.filter((p) => p.score === sg);
        return sgps;
    }, {});
    console.log("score sums", scoreSums);
    console.log("score groups", scoreGroups);
    console.log("scoreGroupPlayers", scoreGroupPlayers);
    // find floaters by each score group
    const reversedScoreGroups = [...scoreGroups].reverse();
    let floatersByScore = {};
    let slicePlayersByScore = {};
    for (let k = 0; k < reversedScoreGroups.length; k++) {
        const sg = reversedScoreGroups[k];
        const prevSg = reversedScoreGroups[k - 1];
        const floatersFromPreviousGroup = prevSg ? floatersByScore[prevSg] : [];
        const currentGroupPlayers = scoreGroupPlayers[sg];
        const slicePlayers = [...floatersFromPreviousGroup, ...currentGroupPlayers];
        console.debug('find floaters', sg, slicePlayers);
        floatersByScore[sg] = findFloaters(slicePlayers);
        const floaterIds = floatersByScore[sg].map((p1) => p1.id);
        slicePlayersByScore[sg] = slicePlayers.filter((p) => {
            return !floaterIds.includes(p.id);
        });
    }
    console.debug("floatersByScore", floatersByScore);
    console.debug("slicePlayersByScore", slicePlayersByScore);
    let pairs = [];
    let debugPairs = [];
    for (let i = 0; i < playerArray.length; i++) {
        const curr = playerArray[i];
        const next = playerArray.slice(i + 1);
        const slicePlayers = slicePlayersByScore[curr.score];
        const halfway = Math.floor((slicePlayers.length + 1) / 2);
        console.debug("slicePlayers", curr.score, halfway, slicePlayers);
        for (let j = 0; j < next.length; j++) {
            const opp = next[j];
            if (curr.hasOwnProperty("avoid") && curr.avoid.includes(opp.id)) {
                continue;
            }
            let debugWt = [];
            // prioritize pair with higher total score
            const scoreSumIndex = scoreSums.findIndex((s) => s === curr.score + opp.score);
            let wtt = 0;
            let wt = 2 * scoreSumIndex;
            debugWt.push(["score", wt]);
            const currIndex = slicePlayers.findIndex((p) => p.id === curr.id);
            const oppIndex = slicePlayers.findIndex((p) => p.id === opp.id);
            if (currIndex > -1 && oppIndex < -1) {
                const swissIndex = Math.abs(oppIndex - currIndex - halfway) + currIndex / 5;
                if (currIndex < halfway && oppIndex >= halfway) {
                    wtt = 1.3 / Math.log10(swissIndex + 2);
                    wt += wtt;
                    debugWt.push([
                        "swiss halfway",
                        wtt,
                        oppIndex,
                        currIndex,
                        halfway,
                        swissIndex,
                    ]);
                }
                else {
                    wtt = 1 / Math.log10(swissIndex + 2);
                    wt += wtt;
                    debugWt.push([
                        "swiss no halfway",
                        wtt,
                        oppIndex,
                        currIndex,
                        halfway,
                        swissIndex,
                    ]);
                }
            }
            if (colors) {
                const colorScore = curr.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
                const oppScore = opp.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
                if (curr.colors.length > 1 && curr.colors.slice(-2).join("") === "ww") {
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
            if (rated) {
                wt +=
                    (Math.log2(next.length) -
                        Math.log2(next.findIndex((p) => p.id === opp.id) + 1)) /
                        3;
                debugWt.push(["rated", wt]);
            }
            // if (opp.hasOwnProperty("receivedBye") && opp.receivedBye) {
            //   const currGroupIndex = scoreGroups.findIndex((s) => s === curr.score);
            //   const oppGroupIndex = scoreGroups.findIndex((s) => s === opp.score);
            //   const scoreGroupDiff = Math.abs(currGroupIndex - oppGroupIndex);
            //   if (oppGroupIndex < 2) {
            //     if (scoreGroupDiff < 2) {
            //       wt += 3 / Math.log10(scoreGroupDiff + 2);
            //       debugWt.push(["bye with low diff", wt]);
            //     } else {
            //       wt += 5 / Math.log10(scoreGroupDiff + 2);
            //       debugWt.push(["bye with high diff", wt]);
            //     }
            //   }
            // }
            pairs.push([curr.index, opp.index, wt]);
            debugPairs.push([curr.index, opp.index, wt, debugWt]);
        }
    }
    if (pairs.length === 0) {
        return [];
    }
    const blossomPairs = blossom(pairs, true);
    console.log("pairings input players", playerArray);
    console.log("debug pairings pairs", debugPairs.sort((a, b) => b[2] - a[2]));
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
        playerCopy.splice(playerCopy.findIndex((p) => p.index === indexB), 1);
        let playerA = playerArray.find((p) => p.index === indexA);
        let playerB = playerArray.find((p) => p.index === indexB);
        if (colors) {
            const aScore = playerA.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
            const bScore = playerB.colors.reduce((sum, color) => (color === "w" ? sum + 1 : sum - 1), 0);
            if (playerB.colors.slice(-2).join("") === "bb" ||
                playerA.colors.slice(-2).join("") === "ww" ||
                (playerB.colors.slice(-1) === "b" &&
                    playerA.colors.slice(-1) === "w") ||
                bScore < aScore) {
                [playerA, playerB] = [playerB, playerA];
            }
        }
        matches.push({
            round: round,
            match: match++,
            player1: playerA.id,
            player2: playerB.id,
        });
    } while (playerCopy.length >
        blossomPairs.reduce((sum, idx) => (idx === -1 ? sum + 1 : sum), 0));
    byeArray = [...byeArray, ...playerCopy];
    for (let i = 0; i < byeArray.length; i++) {
        matches.push({
            round: round,
            match: match++,
            player1: byeArray[i].id,
            player2: null,
        });
    }
    return matches;
}
//# sourceMappingURL=Swiss.js.map