import "./style.css";

/*
 ██████╗ ██████╗ ███╗   ██╗███████╗████████╗ █████╗ ███╗   ██╗████████╗███████╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝██╔════╝
██║     ██║   ██║██╔██╗ ██║███████╗   ██║   ███████║██╔██╗ ██║   ██║   ███████╗
██║     ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║╚██╗██║   ██║   ╚════██║
╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║██║ ╚████║   ██║   ███████║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
 */
const TOOLS = {
  Move: "move",
  Select: "select",
} as const;

type Tool = (typeof TOOLS)[keyof typeof TOOLS];

const CURSOR_STYLES = {
  Auto: "auto",
  Default: "default",
  None: "none",
  ContexMenu: "context-menu",
  Help: "help",
  Pointer: "pointer",
  Progress: "progress",
  Wait: "wait",
  Cell: "cell",
  Crosshair: "crosshair",
  Text: "text",
  VerticalText: "vertical-text",
  Alias: "alias",
  Copy: "copy",
  Move: "move",
  NoDrop: "no-drop",
  NotAllowed: "not-allowed",
  Grab: "grab",
  Grabbing: "grabbing",
  AllScroll: "all-scroll",
  ColResize: "col-resize",
  RowResize: "row-resize",
  NResize: "n-resize",
  EResize: "e-resize",
  SResize: "s-resize",
  WResize: "w-resize",
  NeResize: "ne-resize",
  NwResize: "nw-resize",
  SeResize: "se-resize",
  SwResize: "sw-resize",
  EwResize: "ew-resize",
  NsResize: "ns-resize",
  NeswResize: "nesw-resize",
  NwseResize: "nwse-resize",
  ZoomIn: "zoom-in",
  zoomOut: "zoom-out",
} as const;
/*
██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗     ███████╗███████╗
██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
██║   ██║███████║██████╔╝██║███████║██████╔╝██║     █████╗  ███████╗
╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
 ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝███████╗███████╗███████║
  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝
*/
let selectedTool: Tool = (() => {
  const tool = localStorage.getItem("selectedTool");
  if (Object.values(TOOLS).includes(tool as Tool)) return tool as Tool;
  return TOOLS.Move;
})();

const dragPoint = {
  x: 0,
  y: 0,
};

const mouse = {
  x: 0,
  y: 0,
};
const startDrag = {
  x: 0,
  y: 0,
};
const startSelect = {
  x: 0,
  y: 0,
};
const selectPoint = {
  x: 0,
  y: 0,
};
const startRelocate = {
  x: 0,
  y: 0,
};
const relocatePoint = {
  x: 0,
  y: 0,
};
const selectedNodes = new Set<Enode>();
let isDragging = false;
let isSelecting = false;
let isRelocating = false;
let isTyping = false;
let toolsElement: HTMLElement;

const canvas = new (class Canvas {
  element = document.createElement("canvas");
  get ctx() {
    return this.element.getContext("2d")!;
  }
})();

class Enode {
  static fromLocale() {
    try {
      const parsed = JSON.parse(localStorage.getItem("tree") ?? "");
      
      return new Enode({
        x: parsed.x,
        y: parsed.y,
        w: parsed.w,
        h: parsed.h,
        title: parsed.title,
        childs: parsed.childs,
      });
    } catch (error) {
      console.log(error);
      
      return new Enode();
    }
  }

  #x = -50;
  #y = -50;
  #w = 100;
  #h = 100;
  #selected = false;
  #title = "Meta";
  #textSize = 20;
  #radius = 8;
  #isChangingTitle = false;
  #childs: Enode[] = [];
  #parent: Enode | null = null;

  get selected() {
    return this.#selected;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get w() {
    return this.#w;
  }

  get h() {
    return this.#h;
  }

  get title() {
    return this.#title;
  }

  get childs() {
    return this.#childs;
  }


  get parent() {
    return this.#parent;
  }

  set x(x: number) {
    this.#x = x;
    this.save();
  }

  set selected(selected: boolean) {
    this.#selected = selected;
    if (selected) {
      selectedNodes.add(this);
    } else {
      selectedNodes.delete(this);
    }
    this.save();
  }

  set y(y: number) {
    this.#y = y;
    this.save();
  }

  set w(w: number) {
    this.#w = w;
    this.save();
  }

  set h(h: number) {
    this.#h = h;
    this.save();
  }

  set title(title: string) {
    this.#title = title;
    this.save();
  }

  set parent(parent: Enode | null) {
    this.#parent = parent;
    this.save();
  }

  constructor({
    x,
    y,
    w,
    h,
    title,
    childs,
    parent,
  }: {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    title?: string;
    childs?: Enode[];
    parent?: Enode | null;
  } = {}) {
    
    if (x) this.x = x;
    if (y) this.y = y;
    if (w) this.w = w;
    if (h) this.h = h;
    if (title) this.title = title;
    if (childs) {
      for (const child of childs) {
        this.#childs.push(new Enode({ ...child, parent: this }));
      }
    }
    if (parent) this.#parent = parent;    
    this.save();
  }

  save() {
    if (this.#parent) {
      this.#parent.save();
    } else {
      // clearTimeout(this.#timeout);
      // this.#timeout = setTimeout(() => {
        localStorage.setItem("tree", JSON.stringify(this));
      // }, 100);
    }
  }

  getNodeList() {
    const nodes: Enode[] = [this];
    for (const child of this.#childs) nodes.push(...child.getNodeList());
    return nodes;
  }

  newChild() {
    this.#childs.push(new Enode({
      parent: this,
      x: this.x + this.childs.length * this.w + 20,
      y: this.y + this.h + 20,
    }));
    this.save();
  }

  setChilds(childs: Enode[]) {
    this.#childs = childs;
    this.save();
  }

  render() {
    canvas.ctx.fillStyle = "#1a1a1a";
    canvas.ctx.roundRect(
      this.x + getCenter().x,
      this.y + getCenter().y,
      this.w,
      this.h,
      this.#radius,
    );
    canvas.ctx.fill();
    canvas.ctx.closePath();

    if (!this.#isChangingTitle) {
      canvas.ctx.fillStyle = "#fff";
      canvas.ctx.font = `${this.#textSize}px Arial`;
      const textWidth = canvas.ctx.measureText(this.title).width;
      
      canvas.ctx.fillText(
        this.title,
        this.x + getCenter().x + this.w / 2 - textWidth / 2,
        this.y + getCenter().y + this.#textSize,
      );
    }
    if (this.selected) {
      canvas.ctx.strokeStyle = "#fff";
      canvas.ctx.strokeRect(
        this.x + getCenter().x - 5,
        this.y + getCenter().y - 5,
        this.w + this.#radius,
        this.h + this.#radius,
      );
    }
    if (this.#parent) {
      canvas.ctx.strokeStyle = "#fff";
      canvas.ctx.beginPath();
      canvas.ctx.moveTo(
        this.x + getCenter().x + this.w / 2,
        this.y + getCenter().y,
      );
      canvas.ctx.lineTo(
        this.#parent.x + getCenter().x + this.#parent.w / 2,
        this.#parent.y + getCenter().y + this.#parent.h,
      );
      canvas.ctx.stroke();
      canvas.ctx.closePath();
    }
    this.#childs.forEach((child) => child.render());
  }

  isTextColision(x: number, y: number) {
    canvas.ctx.font = `${this.#textSize}px Arial`;
    const textWidth = canvas.ctx.measureText(this.title).width;
    return isColision(
      {
        x,
        y,
        w: 1,
        h: 1,
      },
      {
        x: this.x + getCenter().x + this.w / 2 - textWidth / 2,
        y: this.y + getCenter().y + this.#radius,
        w: textWidth,
        h: this.#textSize,
      },
    );
  }

  tryChangeTitle() {
    isTyping = true;
    this.#isChangingTitle = true;
    let removed = false;
    canvas.ctx.font = `${this.#textSize}px Arial`;
    const textWidth = canvas.ctx.measureText(this.title).width;
    const input = document.createElement("input");
    input.value = this.title;
    input.style.position = "absolute";
    input.style.left = `${this.x + getCenter().x + this.w / 2 - textWidth / 2
      }px`;
    input.style.top = `${this.y + getCenter().y + this.#radius}px`;
    input.style.width = `${textWidth}px`;
    input.style.height = `${this.#textSize}px`;
    input.style.zIndex = "999999999";
    input.style.border = "none";
    input.style.padding = "0";
    input.style.margin = "0";
    input.style.background = "transparent";
    input.style.color = "#fff";
    input.style.fontSize = `${this.#textSize}px`;
    input.style.fontFamily = "Arial";
    input.style.textAlign = "center";
    input.style.outline = "none";
    input.style.boxShadow = "none";
    input.style.cursor = "text";
    input.addEventListener("blur", () => {
      this.title = input.value;
      this.#isChangingTitle = false;
      if (!removed) input.remove();
      isTyping = false;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        this.title = input.value;
        this.#isChangingTitle = false;
        removed = true;
        input.remove();
        isTyping = false;
      }
    });
    input.addEventListener("input", () => {
      const inputTextWidth = input.scrollWidth;
      if (inputTextWidth > textWidth) {
        input.style.width = `${inputTextWidth}px`;
      }
      if (inputTextWidth > this.w - this.#radius * 2) {
        this.w = inputTextWidth + this.#radius * 2;
      }
      input.style.left = `${this.x + getCenter().x + this.w / 2 - inputTextWidth / 2
        }px`;
    });
    document.body.appendChild(input);
    input.focus();
  }

  isColision(x: number, y: number, w: number, h: number) {
    return isColision({ x, y, w, h }, {
      x: this.x + getCenter().x,
      y: this.y + getCenter().y,
      w: this.w,
      h: this.h,
    });
  }

  toJSON(): EnodeJSON {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      title: this.title,
      childs: this.#childs.map((child) => child.toJSON() as EnodeJSON),
    };
  }
}

type EnodeJSON = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  childs: EnodeJSON[];
};

const tree = Enode.fromLocale();

const center = new (class Center {
  #x = 0;
  #y = 0;

  constructor() {
    try {
      const pc = JSON.parse(localStorage.getItem("center") ?? "");
      if (!isNaN(pc.x)) this.x = pc.x;
      if (!isNaN(pc.y)) this.y = pc.y;
      localStorage.setItem("center", JSON.stringify(this));
    } catch { }
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  set x(x: number) {
    this.#x = x;
    localStorage.setItem("center", JSON.stringify(this));
  }

  set y(y: number) {
    this.#y = y;
    localStorage.setItem("center", JSON.stringify(this));
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
    };
  }
})();

/*
███████╗███████╗████████╗██╗   ██╗██████╗ ███████╗
██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗██╔════╝
███████╗█████╗     ██║   ██║   ██║██████╔╝███████╗
╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ ╚════██║
███████║███████╗   ██║   ╚██████╔╝██║     ███████║
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚══════╝
*/
function setupCanvas(canvasElement: HTMLCanvasElement) {
  canvas.element = canvasElement;
  canvas.element.width = window.innerWidth;
  canvas.element.height = window.innerHeight;
  canvas.element.style.cursor = selectedTool === TOOLS.Move
    ? "grab"
    : "default";

  renderCanvas();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (isDragging) {
      dragPoint.x = e.clientX - startDrag.x;
      dragPoint.y = e.clientY - startDrag.y;
    } else if (isSelecting) {
      selectPoint.x = e.clientX - startSelect.x;
      selectPoint.y = e.clientY - startSelect.y;
    } else if (isRelocating) {
      relocatePoint.x = e.clientX - startRelocate.x;
      relocatePoint.y = e.clientY - startRelocate.y;
      // tree.x = tree.x + relocatePoint.x;
      // tree.y = tree.y + relocatePoint.y;
      tree.getNodeList().forEach((node) => {
        if (node.selected) {
          node.x = node.x + relocatePoint.x;
          node.y = node.y + relocatePoint.y;
        }
      });
      startRelocate.x = e.clientX;
      startRelocate.y = e.clientY;
    }
  });

  window.addEventListener("resize", () => {
    canvas.element.height = window.innerHeight;
    canvas.element.width = window.innerWidth;
  });

  canvas.element.addEventListener("mousedown", (e) => {
    // console.log("start drag", e.clientX, e.clientY);
    if (selectedTool === TOOLS.Move) {
      canvas.element.style.cursor = "grabbing";
      isDragging = true;
      startDrag.x = e.clientX;
      startDrag.y = e.clientY;
    } else if (selectedTool === TOOLS.Select) {
      const allNodes = tree.getNodeList()
      const ic = allNodes.some((node) => node.isColision(e.clientX, e.clientY, 1, 1));
      if (ic) {
        allNodes.forEach((node) => {
            if (node.isColision(e.clientX, e.clientY, 1, 1)) {
              node.selected = true;
            } else {
              node.selected = false;
            }
          });
        isRelocating = true;
        startRelocate.x = e.clientX;
        startRelocate.y = e.clientY;
      } else {
        isSelecting = true;
        startSelect.x = e.clientX;
        startSelect.y = e.clientY;
        allNodes.forEach((node) => node.selected = false);
      }
    }
  });


  // isRelocating = allNodes.some((node) => node.isColision(e.clientX, e.clientY, 1, 1));
  // 
  // if (isRelocating) {
  //   relocatePoint.x = e.clientX - startRelocate.x;
  //   relocatePoint.y = e.clientY - startRelocate.y;
  // }
  canvas.element.addEventListener("mouseup", (e) => {
    // console.log("end drag", e.clientX, e.clientY);
    // console.log("dif", e.clientX - startDrag.x, e.clientY - startDrag.y);

    if (selectedTool === TOOLS.Move) {
      isDragging = false;
      center.x = center.x + (e.clientX - startDrag.x);
      center.y = center.y + (e.clientY - startDrag.y);
      dragPoint.x = 0;
      dragPoint.y = 0;
      canvas.element.style.cursor = "grab";
    } else if (selectedTool === TOOLS.Select) {
      if (!isRelocating) {
        isSelecting = false;
        selectPoint.x = 0;
        selectPoint.y = 0;
      } else {
        isRelocating = false;
        relocatePoint.x = 0;
        relocatePoint.y = 0;
      }
    }
  });

  canvas.element.addEventListener("dblclick", (e) => {
    if (tree.isTextColision(e.clientX, e.clientY)) tree.tryChangeTitle();
  });

  window.addEventListener("keydown", (e) => {
    if (isTyping) return;
    if (e.key === "Escape") {
      tree.getNodeList().forEach((node) => node.selected = false);
    }
    if (e.key === "Delete") {
      selectedNodes.forEach((node) => {
        if (node === tree) return;
        const childs = node.childs;
        if (childs) {
          childs.forEach((child) => child.parent = node.parent);
          node.parent!.setChilds([
            ...node.parent!.childs.filter((child) => child !== node),
            ...childs,
          ])
        } else node.parent!.setChilds(node.parent!.childs.filter((child) => child !== node))
      });
      // tree.getNodeList().forEach((node) => node.selected = false);
    }
    if (!e.altKey) return;
    if (e.key === 'm') {
      setTool(TOOLS.Move);
    }
    if (e.key === 's') {
      setTool(TOOLS.Select);
    }

    // new node
    if (e.key === "n") {
      if (!selectedNodes.size) {
        tree.newChild();
      } else if (selectedNodes.size === 1) {
        selectedNodes.values().next().value.newChild();
      }
    }
  })
}

const setupReturnButton = (button: HTMLButtonElement) =>
  button.addEventListener("click", () => {
    center.x = canvas.element.width / 2;
    center.y = canvas.element.height / 2;
  });

function setupTools(tools: HTMLElement) {
  toolsElement = tools;
  const toolsText: Record<Tool, string> = {
    [TOOLS.Move]: "Move",
    [TOOLS.Select]: "Select",
  };
  tools.innerHTML = "";
  Object.entries(toolsText).forEach(([k, v]) => {
    const button = document.createElement("button");
    button.setAttribute(
      "arial-selected",
      k === selectedTool ? "true" : "false",
    );
    button.innerText = v;
    button.addEventListener("click", () => {
      const toolsButtons = tools.querySelectorAll("button");
      toolsButtons.forEach((button) =>
        button.setAttribute("arial-selected", "false")
      );
      button.setAttribute("arial-selected", "true");
      setTool(k as Tool);
    });
    tools.appendChild(button);
  });
  // tools.querySelector("button")?.click();
}

/*
███████╗██╗   ██╗███╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
██╔════╝██║   ██║████╗  ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
█████╗  ██║   ██║██╔██╗ ██║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
██╔══╝  ██║   ██║██║╚██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
██║     ╚██████╔╝██║ ╚████║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
*/
function setTool(tool: Tool) {
  selectedTool = tool;
  canvas.element.style.cursor = tool === TOOLS.Move
    ? CURSOR_STYLES.Grab
    : CURSOR_STYLES.Default;
  localStorage.setItem("selectedTool", tool);
  toolsElement.querySelectorAll("button").forEach((button) => button.innerText.toLowerCase() === tool ? button.setAttribute("arial-selected", "true") : button.setAttribute("arial-selected", "false"));
}

function getCenter() {
  return {
    x: center.x + dragPoint.x,
    y: center.y + dragPoint.y,
  };
}

function renderCanvas() {
  canvas.ctx.clearRect(0, 0, canvas.element.width, canvas.element.height);
  // mouse
  canvas.ctx.fillStyle = "#ffffff55";
  canvas.ctx.beginPath();
  canvas.ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
  canvas.ctx.fill();
  canvas.ctx.closePath();

  // center
  canvas.ctx.beginPath();
  canvas.ctx.strokeStyle = "#ffffff88";
  canvas.ctx.moveTo(getCenter().x, 0);
  canvas.ctx.lineTo(getCenter().x, canvas.element.height);
  canvas.ctx.stroke();
  canvas.ctx.closePath();

  canvas.ctx.beginPath();
  canvas.ctx.strokeStyle = "#ffffff88";
  canvas.ctx.moveTo(0, getCenter().y);
  canvas.ctx.lineTo(canvas.element.width, getCenter().y);
  canvas.ctx.stroke();
  canvas.ctx.closePath();

  tree.render();

  // drag point
  
  if (selectedTool === TOOLS.Select) {
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = "#fff";
    canvas.ctx.strokeRect(
      startSelect.x,
      startSelect.y,
      selectPoint.x,
      selectPoint.y,
    );
    canvas.ctx.closePath();
    // detect colision
    // const colision = tree.isColision(
    //   selectPoint.x < 0 ? startSelect.x + selectPoint.x : startSelect.x,
    //   selectPoint.y < 0 ? startSelect.y + selectPoint.y : startSelect.y,
    //   Math.abs(selectPoint.x),
    //   Math.abs(selectPoint.y),
    // );
    const colision = tree.getNodeList().filter((node) => {
      return isColision(
        {
          x: selectPoint.x < 0 ? startSelect.x + selectPoint.x : startSelect.x,
          y: selectPoint.y < 0 ? startSelect.y + selectPoint.y : startSelect.y,
          w: Math.abs(selectPoint.x),
          h: Math.abs(selectPoint.y),
        },
        {
          x: node.x + getCenter().x,
          y: node.y + getCenter().y,
          w: node.w,
          h: node.h,
        },
      );
    })
    if (isSelecting) colision.forEach((node) => node.selected = true);
  }

  requestAnimationFrame(renderCanvas);
}

function isColision(
  obj1: { x: number; y: number; w: number; h: number },
  obj2: { x: number; y: number; w: number; h: number },
) {
  return (
    obj1.x + obj1.w > obj2.x &&
    obj1.x < obj2.x + obj2.w &&
    obj1.y + obj1.h > obj2.y &&
    obj1.y < obj2.y + obj2.h
  );
}

function html(a: TemplateStringsArray, ...b: any[]) {
  return a.reduce((acc, cur, i) => acc + b[i - 1] + cur);
}

/***
 *     █████╗ ██████╗ ██████╗
 *    ██╔══██╗██╔══██╗██╔══██╗
 *    ███████║██████╔╝██████╔╝
 *    ██╔══██║██╔═══╝ ██╔═══╝
 *    ██║  ██║██║     ██║
 *    ╚═╝  ╚═╝╚═╝     ╚═╝
 */
document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
  <canvas></canvas>
  <button id="return">Return</button>
  <nav id="tools">
    <button>Move</button>
    <button>Select</button>
  </nav>
`;

setupCanvas(document.querySelector<HTMLCanvasElement>("canvas")!);
setupReturnButton(document.querySelector<HTMLButtonElement>("button")!);
setupTools(document.querySelector<HTMLElement>("#tools")!);
