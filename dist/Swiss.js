import blossom from "edmonds-blossom-fixed";
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
    playerArray
        .sort((p1, p2) => p2.score - p1.score || p2.rating - p1.rating)
        .forEach((p, i) => (p.index = i));
    let pairs = [];
    // devide into score groups
    const scoreGroupsWithPlayers = playerArray.reduce((obj, v) => {
        if (!obj[v.score]) {
            obj[v.score] = [];
        }
        obj[v.score].push(v);
        return obj;
    }, {});
    const scoreGroups = Object.keys(scoreGroupsWithPlayers).sort((s1, s2) => Number(s2) - Number(s1));
    // find the lowest rank of the lowest score group to assign bye
    // remove player from array to avoid it from being paired
    let match = 1;
    let byeMatch = null;
    if (playerArray.length % 2 > 0) {
        for (let i = scoreGroups.length - 1; i >= 0; i--) {
            const score = scoreGroups[i];
            const players = scoreGroupsWithPlayers[score];
            const byeables = players.filter((p) => !p.hasOwnProperty("receivedBye") || !p.receivedBye);
            const bye = byeables.sort((p1, p2) => p1.rating - p2.rating)[0];
            if (!bye) {
                continue;
            }
            playerArray = playerArray.filter((p) => p.id !== bye.id);
            byeMatch = {
                round: round,
                match: match++,
                player1: bye.id,
                player2: null,
            };
            break;
        }
    }
    // give weight depends on the sum score of two players / distance between the two players
    // the higher sum score and the closer two players are together, then the higher weight they get
    // that way, pairs will follow Swiss rule
    for (let i = 0; i < playerArray.length; i++) {
        const curr = playerArray[i];
        const next = playerArray.slice(i + 1);
        for (let j = 0; j < next.length; j++) {
            const opp = next[j];
            if (curr.hasOwnProperty("avoid") && curr.avoid.includes(opp.id)) {
                continue;
            }
            let wt = 0;
            if (wt === 0) {
                wt += 0.1;
            }
            const sum = curr.score + opp.score;
            wt += sum / (j + 1);
            if (colors) {
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
            }
            pairs.push([curr.index, opp.index, wt]);
        }
    }
    const blossomPairs = blossom(pairs, true);
    let playerCopy = [...playerArray];
    do {
        const indexA = playerCopy[0].index;
        const indexB = blossomPairs[indexA];
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
    if (byeMatch) {
        matches.push(byeMatch);
    }
    return matches;
}
//# sourceMappingURL=Swiss.js.map