/**
 * @file 使用vue渲染数据
 * @author muzhilong
 */
var width = 800;
var height = 600;
var blockHeight = 30;

/* global Vue,list*/
new Vue({
    el: '#app',
    data: {
        root: null, // 顶层根节点
        list: null, // 列表
        levels: null // 层次存储
    },
    created: function () {
        this.initData(list);
    },
    mounted: function () {
        console.log('mounted');
        console.log(this.levels);
    },
    methods: {
        // 初始化数据： 计算deep等
        initData: function (data) {
            var keys = {};
            var root = null;
            var levels = [];
            if (!data && !(data.length > 0)) {
                return;
            }

            data.forEach(function (v) {
                keys[v.id] = v;
                v.deep = 0;
                v.open = false;
                v.top = 0;
                v.height = 0;
                v.path = '';
                v.left = 10;
                v.prev = null;
            });
            data.forEach(function (v) {
                if (v.pid > 0) {
                    var p = keys[v.pid];
                    p.children = p.children || [];
                    p.children.push(v);
                    v.parent = p;
                    v.deep = p.deep + 1;
                    v.left = v.deep * 150 + 10;
                    levels[v.deep] = levels[v.deep] || [];
                    levels[v.deep].push(v);
                    v.prev = levels[v.deep][levels[v.deep].length - 2];
                }
                else {
                    root = v;
                    levels[0] = levels[0] || [];
                    levels[0].push(v);
                }
            });

            this.root = root;
            this.list = list;
            this.levels = levels;
            this.calcHeightAndShow(root);
            this.calcTop();
        },
        // 计算所有节点占用的高度和是否展示
        calcHeightAndShow: function (vnode) {
            console.log('vnode:', vnode.id);
            var me = this;
            var height = 0;
            if (vnode.parent && !vnode.parent.open) {
                // 存在父节点并且父节点不展开
                vnode.height = 0;
                vnode.open = false;
            }
            else if (!vnode.open) {
                vnode.height = blockHeight;
            }

            if (vnode.children && vnode.children.length > 0) {
                vnode.children.forEach(function (v) {
                    me.calcHeightAndShow(v);
                    height += v.height;
                });
            }

            if (vnode.open) {
                vnode.height = height || blockHeight;
            }

        },
        // 计算节点的位置
        calcTop: function () {
            this.list.forEach(function (v) {
                if (v.prev && v.prev.parent === v.parent) {
                    // 拥有相同的父节点
                    v.top = v.height / 2 + (v.prev.top + v.prev.height / 2);
                }
                else if (v.parent && v.parent.prev) {
                    // 父节点拥有上一个节点
                    v.top = v.height / 2 + (v.parent.prev.top + v.parent.prev.height / 2);
                }
                else if (v.prev) {
                    v.top = v.height / 2 + (v.prev.top + v.prev.height / 2);
                }
                else {
                    v.top = v.height / 2;
                }
                if (v.parent) {
                    var pLeft = v.parent.left + 65;
                    var pTop = v.parent.top;
                    var mLeft = (v.left + pLeft) / 2;
                    var mTop = (v.top + pTop) / 2;
                    v.path = 'M' + v.left + ' ' + v.top
                        + ' C ' + mLeft + ' ' + v.top + ',' + mLeft + ' ' + pTop
                        + ',' + pLeft + ' ' + pTop;
                }

            });
        },
        // 收缩和展开
        toggle: function (vnode) {
            vnode.open = !vnode.open;
            console.log('toggle:', vnode, vnode.open);
            this.calcHeightAndShow(this.root);
            console.log('toggle2:', vnode, vnode.open);
            this.calcTop();
            console.log('toggle3:', vnode, vnode.open);
        }
    }
});
