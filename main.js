/*
* Maze viewer
* v2.0.0
* By Isaac Chen
* 9/19/2022
*/

// Parses a string into a Result<Maze, MazeErr> where:
//   - Maze is a 2d array of ints with equal column widths
//   - MazeErr is a string describing what went wrong
function parse_maze(str) {
    const maze = str.split("\n");
    
    // Strip trailing newline
    if(maze[maze.length - 1].length === 0) maze.pop();
    
    let maze_width = null;
    for(let i = 0; i < maze.length; i++) {
        // Split the row by spaces
        maze[i] = maze[i].split(" ").filter(x => x !== "");

        // Ensure we have consistent widths
        maze_width ??= maze[i].length;
        if(maze[i].length !== maze_width) {
            return Err("Invalid maze dimensions\n(Not all rows have the same number of cells)");
        }

        // Strip trailing space
        if(maze[i][maze[i].length - 1] === "") maze[i].pop();
        
        // Parse each cell into an int
        for(let j = 0; j < maze[i].length; j++) {
            let contains_only_digits = /^[0-9]*$/.test(maze[i][j]);
            if(!contains_only_digits) {
                return Err("Invalid cell value\n(Some cells are something besides digits)");
            }

            maze[i][j] = parseInt(maze[i][j]);

            if(maze[i][j] < 0 || maze[i][j] > 15) {
                return Err("Invalid cell value\n(Some cells are less than 0 or greater than 15)");
            }
        }
    }

    // Ensure the maze isn't empty
    if(maze.length === 0 || maze[0].length === 0) {
        return Err("Invalid maze dimensions\n(Maze cannot be empty)")
    }
    
    return Ok(maze);
}

// Draws a line on a canvas context
function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Renders one cell at the given position
function render_box(ctx, data, x, y, width, extended_info) {
    ctx.strokeStyle = "#74889E";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    const n = (data & 0b1000) === 0b1000;
    const s = (data & 0b0100) === 0b0100;
    const e = (data & 0b0010) === 0b0010;
    const w = (data & 0b0001) === 0b0001;
    
    if(n) line(ctx, x, y, x + width, y);
    if(s) line(ctx, x, y + width, x + width, y + width);
    if(e) line(ctx, x + width, y, x + width, y + width);
    if(w) line(ctx, x, y, x, y + width);

    if(extended_info) {
        let font_size = Math.floor(width / 5);
        ctx.font = `${font_size}px monospace`;
        ctx.fillStyle = "#74889E";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(`${data}`, x + width / 2, y + width / 2);
    }
}

(function main() {
    const DEFAULT_MAZE = [
        "3 13 8 8 14 ",
        "5 10 3 5 10 ",
        "9 6 5 14 3 ",
        "3 9 10 9 2 ",
        "5 6 5 6 3 ",
        ""
    ].join("\n");
    
    // Get access to DOM elements
    let dom = {
        maze_input: document.getElementById("maze_input"),
        canvas: document.getElementById("maze_output"),
        extended_info: document.getElementById("extended_info"),
    };

    // Update maze input
    dom.maze_input.value = DEFAULT_MAZE;

    // Prepare to draw to the canvas
    let ctx = dom.canvas.getContext("2d");
    let width = dom.canvas.width;
    let height = dom.canvas.height;

    // Start draw loop
    (function draw() {
        // Parse the maze
        const maze_result = parse_maze(dom.maze_input.value);
        // If the maze parsed with errors:
        if(maze_result.is_err()) {
            let err_msgs = maze_result.unwrap_err().split("\n");

            // Background
            ctx.fillStyle = "#D05050";
            ctx.fillRect(0, 0, width, height);

            // Error text
            let font_size = Math.floor(width / 25);
            let line_height_approx = font_size * 1.3;
            ctx.font = `${font_size}px sans-serif`;
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
    
            for(let i = 0; i < err_msgs.length; i++) {
                let x = width / 2;
                let y = height / 2 + (i - (err_msgs.length - 1) / 2) * line_height_approx;
                
                ctx.fillText(err_msgs[i], x, y, width);
            }
        }
        // If the maze parsed without error:
        else {
            let maze = maze_result.unwrap();

            const box_w = Math.min(width / maze[0].length, height / maze.length);
            const offset_x = (width - (box_w * maze[0].length)) / 2;
            const offset_y = (height - (box_w * maze.length)) / 2;

            // Background
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#2A3C50";
            ctx.fillRect(offset_x, offset_y, box_w * maze[0].length, box_w * maze.length);
            
            // Render every cell
            for(let row = 0; row < maze.length; row++) {
                for(let col = 0; col < maze[row].length; col++) {
                    let x = offset_x + col * box_w;
                    let y = offset_y + row * box_w;

                    render_box(ctx, maze[row][col], x, y, box_w, dom.extended_info.checked);
                }
            }
        }

        // Request the next frame
        requestAnimationFrame(draw);
    })();
})();
