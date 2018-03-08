var canvas = document.getElementById("canvas");
var processing = new Processing(canvas, function(processing) {
    processing.size(400, 400);
    processing.background(0xFFF);

    var mouseIsPressed = false;
    processing.mousePressed = function () { mouseIsPressed = true; };
    processing.mouseReleased = function () { mouseIsPressed = false; };

    var keyIsPressed = false;
    processing.keyPressed = function () { keyIsPressed = true; };
    processing.keyReleased = function () { keyIsPressed = false; };

    function getImage(s) {
        var url = "https://www.kasandbox.org/programming-images/" + s + ".png";
        processing.externals.sketch.imageCache.add(url);
        return processing.loadImage(url);
    }

    function getLocalImage(url) {
        processing.externals.sketch.imageCache.add(url);
        return processing.loadImage(url);
    }

    // use degrees rather than radians in rotate function
    var rotateFn = processing.rotate;
    processing.rotate = function (angle) {
        rotateFn(processing.radians(angle));
    };

    with (processing) {
      
var getPosOnGrid = function(Point, grid)
{
    var pos = {
        xPos : round((Point.xPos - ((grid.cell_w / 2) + grid.xPos)) / grid.cell_w),
        yPos : round((Point.yPos - ((grid.cell_h / 2) + grid.yPos)) / grid.cell_h),
    };
    pos = {
        xPos : constrain(pos.xPos, 0, grid.cols - 1),
        yPos : constrain(pos.yPos, 0, grid.rows - 1),
        col : pos.xPos,
        row : pos.yPos,
    };
    return pos;
};

var Camera = function(xPos, yPos, Width, Height)
{
    this.xPos = xPos;
    this.yPos = yPos; 
    this.Width = Width;
    this.Height = Height;
    
    this.upperLeft = {
        xPos : 0,
        yPos : 0,
    };
    this.lowerRight = {
        xPos : 0,
        yPos : 0,
    };
    
    this.extensions = [];
    this.addExtensions = function()
    {
        for(var i = 0; i < random(3, 15); i++)
        {
            this.extensions.push([round(random(0, 9)), round(random(0, 9)), false]);
        }
    };
    this.addExtensions();
    
    this.draw = function(grid)
    {
        fill(0, 0, 0, 50);
        rect(this.xPos, this.yPos, this.Width, this.Height);
        
        fill(0, 0, 0);
        var pointSize = 12;
        ellipse(this.xPos, this.yPos, pointSize, pointSize);
        ellipse(this.xPos + this.Width, this.yPos + this.Height, pointSize, pointSize);
        
        var target_x;
        var target_y;
        var triggered = false;
        
        for(var x = this.upperLeft.xPos; x < this.lowerRight.xPos; x++)
        {
            for(var y = this.upperLeft.yPos; y < this.lowerRight.yPos; y++)
            {

                for(var i = 0; i < this.extensions.length; i++)
                {
                    target_x = this.extensions[i][0];
                    target_y = this.extensions[i][1];
                    triggered = ((y === target_y && 
                                 (x === target_x - 1 || x === target_x + 1)) ||
                                 (x === target_x && 
                                 (y === target_y - 1 || y === target_y + 1)));
                    if(triggered)
                    {
                        this.extensions[i][2] = true; 
                        if(!grid[target_x][target_y].hide)
                        {
                            grid.drawCell({
                                xPos : target_x,
                                yPos : target_y,
                            });
                            
                            grid[target_x][target_y].hide = true;
                        }   
                    }
                }
                
                grid.drawCell({
                    xPos : x,
                    yPos : y,
                });
            }
        }
        if(triggered)
        {
            for(var i = 0; i < this.extensions.length; i++)
            {
                if(this.extensions[i][2])
                {
                    grid[this.extensions[i][0]][this.extensions[i][1]].hide = false;
                }
            }
        }
    };
    
    this.update = function(grid)
    {
        this.xPos = mouseX;
        this.yPos = mouseY;
        this.xPos = constrain(this.xPos, grid.xPos, 
        (grid.xPos + grid.Width) - this.Width);
        this.yPos = constrain(this.yPos, grid.yPos, 
        (grid.yPos + grid.Height) - this.Height);
        
        this.upperLeft = getPosOnGrid({
            xPos : this.xPos,
            yPos : this.yPos,
        }, grid);
        this.lowerRight = getPosOnGrid({
            xPos : this.xPos + this.Width + grid.cell_w,
            yPos : this.yPos + this.Height + grid.cell_h,
        }, grid);
    };
    
    this.getObjectsInView = function(grid, objs)
    {
        var refs = [];
        for(var x = this.upperLeft.xPos; x < this.lowerRight.xPos; x++)
        {
            for(var y = this.upperLeft.yPos; y < this.lowerRight.yPos; y++)
            {
                refs.push(grid[x][y]);
                grid[x][y] = [];
            }
        }
        
        for(var i = 0; i < this.extensions.length; i++)
        {
            var x = this.extensions[i][0];
            var y = this.extensions[i][1];
            if(this.extensions[i][2])
            {
                refs.push(grid[x][y]);
                grid[x][y] = [];
                this.extensions[i][2] = false;
            }
        }
        return refs;
    };
}; 

var cam = new Camera(0, 0, 80, 80);

var gridMap = [
    "           ",
    "           ",
    "           ",
    "      aa   ",
    "      aa   ",
    "           ",
    "           ",
    "           ",
    "  bb       ",
];
gridMap.draw = function()
{
    var gridWidth = 15;
    var gridHeight = 15;
    
    var act_gridWidth = gridWidth;
    var act_gridHeight = gridHeight;
    
    var hitCol = false;
    for(var i = 0; i < this.length; i++)
    {
        var systemHeight = 0;
        for(var j = 0; j < this[i].length; j++)
        {
            if(this[i][j] === '2')
            {
                
                var k = i;
                while(k < this.length && this[k][j] === '2')
                {
                    systemHeight++;
                    k++;   
                }
                if(!hitCol)
                {
                    fill(0, 0, 255);
                    rect(j * act_gridWidth, i * gridWidth,
                    act_gridWidth, act_gridHeight * systemHeight);
                }
                if(systemHeight >= 2)
                {
                    hitCol = true;
                }
            }
            // if(this[i][j] === '2' && (i < this.length - 1 && 
            // this[i + 1][j] === '2'))
            // {
            //     fill(0, 0, 200);
            //     act_gridHeight *= 2;
            //     rect(j * act_gridWidth, i * gridWidth,
            //     act_gridWidth, act_gridHeight);
            // }
            act_gridWidth = gridWidth;
            act_gridHeight = gridHeight;
            if(this[i][j] === '1')
            {   
                noFill();
                rect(j * gridWidth, i * gridHeight, gridWidth, gridHeight);
            }
        }
    }
};

var grid = [];
grid.create = function(xPos, yPos, cols, rows, gridWidth, gridHeight)
{
    this.xPos = xPos;
    this.yPos = yPos;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cell_w = gridWidth;
    this.cell_h = gridHeight;
    this.cols = cols;
    this.rows = rows;
    this.length = 0;
    
    for(var i = 0; i < cols; i++)
    {
        this.push([]);
        for(var j = 0; j < rows; j++)
        {
            this[i].push({
                startXPos : 0,
                startYPos : 0,
                endXPos : 1,
                endYPos : 1,
                symbol : ''
            });
        }
    }
    
    // this[6][3].symbol = 'a';
    // this[7][3].symbol = 'a';
    // this[6][4].symbol = 'a';
    // this[7][4].symbol = 'a';
    
    this[6][3].endXPos = 2;
    this[6][3].endYPos = 2;
    
    this[7][3].startXPos = -1;
    this[7][3].endYPos = 2;
    
    this[6][4].endXPos = 2;
    this[6][4].startYPos = -1;
    
    this[7][4].startXPos = -1;
    this[7][4].startYPos = -1;
}; 
grid.draw = function() 
{
    var skipColRender = [];
    for(var i = 0; i < this.length; i++)
    {
        for(var j = 0; j < this[i].length; j++)
        {
            switch(this[i][j].symbol)
            {
                 case '': case ' ':
                        noFill();
                    break;
                    
                case 'a' :
                        fill(0, 120, 220);
                    break;
                 
                case 'b' : 
                        fill(10, 220, 110);
                    break;
            }
            
            rect(this.xPos + i * this.gridWidth, this.yPos + j * this.gridHeight,
            this.gridWidth, this.gridHeight);   
        }
    }
};
grid.drawPoint = function(col, row)
{
    rect(this.xPos + col * this.gridWidth, 
    this.yPos + row * this.gridHeight, 
    this.gridWidth, this.gridHeight);
};
grid.show = function(xPos, yPos)
{
    var Point = {
        xPos : xPos,
        yPos : yPos,
    };
    var place = getPosOnGrid(Point, this);
    
    fill(0, 0, 0, 100);
    
    var cell = this[place.xPos][place.yPos];

    for(var i = cell.startXPos; i < cell.endXPos; i++)
    {
        for(var j = cell.startYPos; j < cell.endYPos; j++)
        {
            this.drawPoint(place.xPos + i, place.yPos + j);
        }
    }
};
grid.setGridMap = function(gridMap)
{
    for(var i = 0; i < gridMap.length && i < this.length; i++)
    {
        for(var j = 0; j < gridMap[i].length && j < this[i].length; j++)
        {
            this[j][i].symbol = gridMap[i][j];
        }
    }
};

grid.create(200, 10, 10, 10, 10, 10);
grid.setGridMap(gridMap);


var cameraGrid = [];
cameraGrid.create = function(config)
{
    this.xPos = config.xPos || 0;
    this.yPos = config.yPos || 0;
    
    this.cell_w = config.cell_w;
    this.cell_h = config.cell_h;
    this.cols = config.cols;
    this.rows = config.rows;
    
    this.Width  = config.Width || this.cols * this.cell_w;
    this.Height = config.Height || this.rows * this.cell_h;
   
    this.setup(this.cols, this.rows);
};
cameraGrid.setup = function(cols, rows)
{
    this.splice(0, this.length);
    for(var col = 0; col < cols; col++)
    {
        this.push([]);
        for(var row = 0; row < rows; row++)
        {
            this[col].push([]);
        }
    }
};
cameraGrid.addObjects = function(objs)
{
    for(var i = 0; i < objs.length; i++)
    {
        var obj = objs[i];
        var Pos = getPosOnGrid(obj, cameraGrid);
        this[Pos.xPos][Pos.yPos].push(i);
    }
};
cameraGrid.drawCell = function(Point)
{
    if(!this[Point.xPos][Point.yPos].hide)
    {
        fill(0, 0, 0, 100);
        rect(this.xPos + Point.xPos * this.cell_w, this.yPos + Point.yPos * this.cell_h, 
        this.cell_w, this.cell_h);
    }
};
cameraGrid.draw = function() 
{
    for(var col = 0; col < this.cols; col++)
    {
        for(var row = 0; row < this.rows; row++)
        {
            var x = this.xPos + col * this.cell_w;
            var y = this.yPos + row * this.cell_h;
            fill(this[col][row]);
            rect(x, y, this.cell_w, this.cell_h);
        }
    }
};
cameraGrid.addRef = function(ref, obj)
{
    var pos = getPosOnGrid(obj, cameraGrid);
    this[pos.xPos][pos.yPos].push(ref);
};

var gameObject = function(xPos, yPos, Width, Height, Color)
{
    this.xPos = xPos;
    this.yPos = yPos;
    this.Width = Width;
    this.Height = Height;
    this.Color = Color; 
    
    this.xvel = random(-1, 1) * 15;
    this.yvel = random(-1, 1) * 15;
    
    this.draw = function() 
    {
        fill(this.Color);
        rect(this.xPos, this.yPos, Width, Height);
    };
    
    this.update = function()
    {
        this.xPos = constrain(this.xPos, 0, cameraGrid.Width - this.Width);
        this.yPos = constrain(this.yPos, 0, cameraGrid.Height - this.Height); 
        
        this.xPos -= ((this.xPos - (mouseX + (cam.Width / 2))) / width) * -this.xvel;
        this.yPos -= ((this.yPos - (mouseY + (cam.Height / 2))) / height) * -this.yvel;
    };
};

var gameObjects = [];
gameObjects.create = function(amt)
{
    for(var i = 0; i < amt; i++)
    {
        this.push(new gameObject(random(0, width), random(0, height), 15, 15, 
        color(random(0, 255), random(0, 255), random(0, 255))));
    }
};
gameObjects.apply = function() 
{
    var objrefs = cam.getObjectsInView(cameraGrid, gameObjects);
    for(var i = 0; i < objrefs.length; i++)
    {
        for(var j = 0; j < objrefs[i].length; j++)
        {
            var ref = objrefs[i][j];
            cameraGrid.addRef(ref, this[ref]);
          
            this[ref].draw();
            this[ref].update();
        }
    }
};

cameraGrid.create({
    cell_w : 40,
    cell_h : 40,
    cols : 10,
    rows : 10,
    Width : 400,
    Height : 400,
});
gameObjects.create(100);
cameraGrid.addObjects(gameObjects);

draw = function() 
{
    background(255, 255, 255);
    frameRate(30);
    
    cameraGrid.draw();
    cam.draw(cameraGrid);
    cam.update(cameraGrid);
    gameObjects.apply();
     //grid.draw();
    //grid.show(mouseX, mouseY);
    
    fill(0, 0, 0);
    text("col : " + cam.upperLeft.xPos + ", row : " + cam.upperLeft.yPos, 
    width * 0.75, 20);
};

    }
    if (typeof draw !== 'undefined') processing.draw = draw;
});