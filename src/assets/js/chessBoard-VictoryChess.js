/**
 *
 * @param x {number}    坐标x
 * @param y {number}    坐标y
 * @param camp  {number}    黑棋还是白棋
 * @param chessBoard {Array}    棋盘
 * @return {boolean}    有就返回数组，没有返回false
 */
function checkOver(x, y, camp, chessBoard) {
    // let chs = checkerBoard.filter((n, i) => i % 2 === camp);
    let winArr = false
    WinChessPieces_5(x, y).forEach(arr => {
        if(arr.every( item =>{
            let piece = item.split("-")
            return chessBoard[piece[0]][piece[1]] === camp
        })){
            winArr = arr
        }
    })
    return winArr
}

/**
 *  找出所有可能赢的位置
 * @param x
 * @param y
 * @return {*[][]}
 */
function possibleLocations_9(x, y){
    if(x > 15 || x < 0 || y > 15 || y < 0){
        return;
    }
    let wins = [
        [],
        [],
        [],
        []
    ];
    for (let i = -4; i <= 4; i++) {
        let h = (x + i) > 0 && (x + i) < 16,
            r = (y + i) > 0 && (y + i) < 16,
            zh = (y - i) < 16 && (y - i) > 0
        if (h) wins[0].push(`${x+i}-${y}`);
        //纵向9子
        if (r) wins[1].push(`${x}-${y+i}`);
        //左上右下
        if (h && r) wins[2].push(`${x+i}-${y+i}`);
        //右上左下
        if (h && zh) wins[3].push(`${x+i}-${y-i}`);
    }
    return wins.filter(arr => arr.length >= 5);
}

/**
 * 计算出可能赢的组合
 * @param x
 * @param y
 * @return {*[]}
 * @constructor
 */
function WinChessPieces_5(x, y) {
    let wins = [];
    possibleLocations_9(x, y).forEach(arr => {
        for (let i = 0; i < arr.length - 4; i++) {
            wins.push(arr.slice(i, i + 5));
        }
    })
    return wins;
}

export default { checkOver }