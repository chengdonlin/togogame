function initCheckerboard() {
    console.log('开始绘制五子棋棋盘')
    let chess = document.getElementById('chess');
    let context = chess.getContext('2d');
    let chessSize = 35
    context.strokeStyle = "#ced4da"
    initChessBoard();

    // 绘制棋盘网格
    function initChessBoard() {
        for (let i = 0; i < 16; i++) {
            context.moveTo(chessSize / 2 + i * chessSize, chessSize / 2);
            context.lineTo(chessSize / 2 + i * chessSize, chessSize * 15 + chessSize / 2);
            context.stroke();
            context.moveTo(chessSize / 2, chessSize / 2 + i * chessSize);
            context.lineTo(chessSize * 15 + chessSize / 2, chessSize / 2 + i * chessSize);
            context.stroke();
        }
    }
}

export {initCheckerboard}