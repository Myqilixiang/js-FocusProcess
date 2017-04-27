import $ from 'jquery'
var currentFocus;//当前获取焦点的节点元素
var node;//辅助变量用来接变量
var nextFocusNode;//下一个获取焦点的节点元素
var enterSwitch;//回车键控制开关，控制走焦点切换还是选中click
var forWardKeySwitch;//右键控制开关，控制走焦点切换还是选中click
var backWardKeySwitch;//左键控制开关，控制走焦点切换还是选中click
var jumpUpSwitch;//上键控制开关，true时候上健可以跳出整组radio或checkbox组件
var jumpDownSwitch;//下键控制开关，true时候下健可以跳出整组radio或checkbox组件
var currentKeyCode;//当前触发事件的按键

//主方法
class FocusProcess {
    focus() {
        $.getJSON("static/config.json",function(data){
            console.log(data)
        })
        document.addEventListener('keydown', (event) => {
            event = event || window.event;
            event.preventDefault()
            currentKeyCode = event.keyCode;
            console.log("当前按键为：" + currentKeyCode);
            this.processKeypressEvent(currentKeyCode);
        }, false);
    }

    // 处理按键事件
    processKeypressEvent(keycode) {
        currentFocus = document.activeElement;
        this.initialSwitch(currentFocus);
        console.log("当前焦点在" + currentFocus);
        if (keycode == '13') {
            if (enterSwitch == true) {
                currentFocus.click();
            } else {
                // 焦点前进
                this.focusForward(currentFocus);
                node = nextFocusNode;
                currentFocus.blur();
                node.focus();
                console.log('焦点切换到：' + node.id);
            }
        }
        else if (keycode == '37') {
            // 左键
            if (backWardKeySwitch == true) {
                this.focusBackward(currentFocus);
                node = nextFocusNode;
                currentFocus.blur();
                node.focus();
                console.log('焦点切换到：' + node.id);
            }
        } else if (keycode == '38') {
            // 上键
            this.focusBackward(currentFocus);
            node = nextFocusNode;
            currentFocus.blur();
            node.focus();
            console.log('焦点切换到：' + node.id);
        } else if (keycode == '39') {
            //右键
            if (forWardKeySwitch == true) {
                this.focusForward(currentFocus);
                node = nextFocusNode;
                currentFocus.blur();
                node.focus();
                console.log('焦点切换到：' + node.id);
            }
        } else if (keycode == '40') {
            //下键
            this.focusForward(currentFocus);
            node = nextFocusNode;
            currentFocus.blur();
            node.focus();
            console.log('焦点切换到：' + node.id + '\n');
        }
    }


    /**
     * 焦点前进
     * 当前获取焦点的元素是body或html时候，触发enter时前序遍历获取第一个可以置焦点的元素并赋焦点
     * 当前获取元素不是body时后序遍历dom树实现焦点前移
     * @param {any} node 
     * @returns  
     */
    focusForward(node) {
        if (node.nodeName.toLowerCase() == 'body') {
            // 如果当前获取焦点的是body
            this.findFirstFocus(node);
        } else {
            // 如果当前获得焦点的元素不是body
            this.findForwardNode(node);
        }
    }


    /**
     * 当前焦点为body时候找到第一个可以获得焦点的元素（没有处理第一个是button的情况）
     * 
     * @param {any} node 
     * @returns node
     */
    findFirstFocus(node) {
        let findNode = false;
        let curNode = node;
        while (curNode.hasChildNodes) {
            if (curNode.firstElementChild == null) {
                break;
            } else {
                curNode = curNode.firstElementChild;
                if (this.availableFocus(curNode)) {
                    nextFocusNode = curNode;
                    findNode = true;
                    break;
                }
            }
        }
        if (findNode == false) {
            this.findForwardNode(curNode);
        }
    }


    /**
     * 找到向前的焦点元素
     * 
     * @param {any} node 
     */
    findForwardNode(node) {
        let findNode = false;
        while ((node.nextElementSibling != null) && (currentKeyCode != '40' || jumpUpSwitch != true)) {
            node = node.nextElementSibling;
            if (this.availableFocus(node)) {

                findNode = true;
                nextFocusNode = node;
                console.log("找到兄弟节点" + nextFocusNode.id);
                break;
                // return node;
            } else {
                let linshinode = node;
                console.log("新节点:" + linshinode.id);
                while (linshinode.hasChildNodes()) {
                    if (linshinode.firstElementChild == null) {
                        break;
                    } else {
                        linshinode = linshinode.firstElementChild;
                        console.log("新节点的孩子节点:" + linshinode);
                        if (this.availableFocus(linshinode)) {
                            // return newNode;
                            findNode = true;
                            nextFocusNode = linshinode;
                            console.log("找到了要返回的孩子：" + nextFocusNode.id);
                            break;
                        }
                    }

                }
                if (findNode == false) {
                    this.findForwardNode(linshinode);
                    // 注意此时要跳出里层函数，所以return
                    if (nextFocusNode != currentFocus) {
                        return;
                    }
                } else {
                    console.log("找到了应该找到的孩子节点")
                    break;
                }
            }
        }
        if (findNode == false) {
            node = node.parentElement;
            console.log("切换新的分支前的节点:" + node);
            if (node.nodeName.toLowerCase() == 'body') {
                // 末尾元素的焦点切换实现焦点循环
                this.findFirstFocus(node);
            } else {
                if (jumpUpSwitch == true) {
                    this.jumpSwitchControler('shutdown');
                }
                this.findForwardNode(node);
            }
        } else {
            console.log("找到了最终要返回的孩子" + nextFocusNode.id)
            return;
        }
    }


    /**
     * 焦点回退
     * 采用焦点前进相反的方式
     * @param {any} node 
     * @returns 
     */
    focusBackward(node) {
        this.findBackwardNode(node);
    }


    /**
     * 找到回退焦点的节点
     * 
     * @param {any} node 
     * @returns 
     */
    findBackwardNode(node) {
        let findNode = false;
        while ((node.previousElementSibling != null) && (currentKeyCode != '38' || jumpDownSwitch != true)) {
            node = node.previousElementSibling;
            if (this.availableFocus(node)) {

                findNode = true;
                nextFocusNode = node;
                console.log("找到兄弟节点" + nextFocusNode.id);
                break;
                // return node;
            } else {
                let linshinode = node;
                console.log("新节点:" + linshinode.id);
                while (linshinode.hasChildNodes()) {
                    if (linshinode.lastElementChild == null) {
                        break;
                    } else {
                        linshinode = linshinode.lastElementChild;
                        console.log("新节点的孩子节点:" + linshinode);
                        if (this.availableFocus(linshinode)) {
                            // return newNode;
                            findNode = true;
                            nextFocusNode = linshinode;
                            console.log("找到了要返回的孩子：" + nextFocusNode.id);
                            break;
                        }
                    }

                }
                if (findNode == false) {
                    this.findBackwardNode(linshinode);
                    // 注意此时要跳出里层函数，所以return
                    if (nextFocusNode != currentFocus) {
                        return;
                    }
                } else {
                    console.log("找到了应该找到的孩子节点")
                    break;
                }
            }
        }
        if (findNode == false) {
            node = node.parentElement;
            console.log("切换新的分支前的节点:" + node.id);
            if (jumpDownSwitch == true) {
                this.jumpSwitchControler('shutdown');
            }
            this.findBackwardNode(node);
        } else {
            console.log("找到了最终要返回的孩子" + nextFocusNode.id)
            return;
        }
    }


    /**
     * 初始化上下左右键事件开关
     * 
     * @param {any} node 
     * @returns 
     */
    initialSwitch(node) {
        if (node.nodeName.toLowerCase() == 'input') {
            if ((node.getAttribute("type") == 'radio') || (node.getAttribute("type") == 'checkbox') || (node.getAttribute("type") == 'button')) {
                jumpDownSwitch = true;
                jumpUpSwitch = true;
                forWardKeySwitch = true;
                backWardKeySwitch = true;
            }
        }
    }


    /**
     * 判断当前节点是否可以给于焦点
     * 
     * @param {any} node 
     * @returns boolean
     */
    availableFocus(node) {
        if (node.nodeName.toLowerCase() == 'input') {
            //判断需要选择的form表单元素处理，此时enter需要执行先焦点选中后click
            if ((node.getAttribute("type") == 'radio') || (node.getAttribute("type") == 'checkbox') || (node.getAttribute("type") == 'button')) {
                // 开启上下箭头可以切换焦点跳级
                // 开启左右箭头可以切换选项
                this.jumpSwitchControler('start');
                enterSwitch = true;
            } else {
                this.jumpSwitchControler('shutdown');
                enterSwitch = false;
            }
            return true;
        } else if (node.nodeName.toLowerCase() == 'button') {
            this.jumpSwitchControler('shutdown');
            enterSwitch = true;
            return true;
        } else if (node.nodeName.toLowerCase() == 'div') {
            this.jumpSwitchControler('shutdown');
            console.log("进入div判断:" + node.id);
            if (node.hasAttribute('onclick')) {
                console.log("div绑定了onclick事件");
                // 添加属性是的div元素能够获取焦点
                node.setAttribute("tabindex", "0");
                enterSwitch = true;
                return true;
            } else {
                console.log("div没有绑定onclick事件");
                return false;
            }
        } else if (node.nodeName.toLowerCase() == 'span') {
            this.jumpSwitchControler('shutdown');
            if (node.hasAttribute("onclick")) {
                return true;
            } else {
                return false;
            }
        } else if (node.nodeName.toLowerCase() == 'select') {
            //TODO：需要添加相关控制键处理事件
            enterSwitch = true;
            return true;
        } else if (node.nodeName.toLowerCase() == 'a') {
            this.jumpSwitchControler('shutdown');
            enterSwitch = true;
            return true;
        }
    }


    /**
     * 过滤控制键的默认事件,包括上下左右和enter
     * 
     */
    preventDefaultKeyEvent(event) {
        if (event.keyCode == '13' || event.keyCode == '37' || event.keyCode == '38' || event.keyCode == '39' || event.keyCode == '40') {
            event.preventDefault();
        }
    }


    /**
     * 控制上下键跳级开关，主要应用在radio，checkbox中控制上下键直接跳出本层元素
     * 
     */
    jumpSwitchControler(str) {
        if (str == 'start') {
            jumpUpSwitch = true;
            jumpDownSwitch = true;
            forWardKeySwitch = true;
            backWardKeySwitch = true;
        } else if (str == 'shutdown') {
            jumpUpSwitch = false;
            jumpDownSwitch = false;
            forWardKeySwitch = false;
            backWardKeySwitch = false;
        }
    }
}
export default new FocusProcess();
