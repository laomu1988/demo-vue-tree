/**
 * @file 使用vue渲染数据
 * @author muzhilong
 */
var width = 800;
var height = 600;
var blockHeight = 30;
var blockWidth = 150;

/* global Vue,list*/
new Vue({
    el: '#app',
    data: {
        rules: {
            min: 200,
            max: 350
        },
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
        compare: function (v1, v2) {
            if (v1.deep !== v2.deep) {
                return v1.deep - v2.deep;
            }

            if (v1.parent === v2.parent) {
                return v1.id - v2.id;
            }

            return this.compare(v1.parent, v2.parent);
        },
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
                v.top = 0;
                v.height = 0;
                v.path = '';
                v.left = 10;
                v.prev = null; // 前一个节点
                v.red = false; // 是否标红
            });
            data.forEach(function (v) {
                if (v.pid > 0) {
                    var p = keys[v.pid];
                    p.children = p.children || [];
                    p.children.push(v);
                    v.parent = p;
                    v.deep = p.deep + 1;
                    v.left = v.deep * 150 + 10;
                    v.open = v.deep < 3;
                }
                else {
                    root = v;
                    v.open = true;
                }
            });
            data.sort(this.compare);
            data.forEach(function (v) {
                levels[v.deep] = levels[v.deep] || [];
                levels[v.deep].push(v);
                v.prev = levels[v.deep][levels[v.deep].length - 2];
            });

            this.root = root;
            this.list = list;
            this.levels = levels;
            this.red();
            this.calcHeight(root);
            this.calcTop();
        },
        red: function () {
            var me = this;
            this.list.forEach(function (v) {
                if (v.value > me.rules.min && v.value <= me.rules.max) {
                    v.red = true;
                    var p = v.parent;
                    while (p) {
                        p.open = true;
                        p = p.parent;
                    }
                }
                else {
                    v.red = false;
                }
            });
        },
        // 更改过滤规则
        changeRule: function () {
            var me = this;
            this.$nextTick(function () {
                me.red();
                me.calcHeight(me.root);
                me.calcTop();
            });
        },
        // 计算所有节点占用的高度和是否展示
        calcHeight: function (vnode) {
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
                    me.calcHeight(v);
                    height += v.height;
                });
            }

            if (vnode.open) {
                vnode.height = height || blockHeight;
            }

        },
        // 计算节点的位置
        calcTop: function (vnode, prevHeight) {
            if (!vnode) {
                vnode = this.root;
            }

            prevHeight = prevHeight || 0;
            vnode.top = prevHeight + vnode.height / 2;
            if (vnode.children && vnode.children.length > 0) {
                for (var i = 0; i < vnode.children.length; i++) {
                    var height = vnode.children[i].height;
                    this.calcTop(vnode.children[i], prevHeight);
                    prevHeight += height;
                }
            }

            if (vnode.parent) {
                var pLeft = vnode.parent.left + blockWidth - 80;
                var pTop = vnode.parent.top;
                var mLeft = (vnode.left + pLeft) / 2;
                var mTop = (vnode.top + pTop) / 2;
                vnode.path = 'M' + vnode.left + ',' + vnode.top
                    + ' C ' + mLeft + ' ' + vnode.top + ',' + mLeft + ' ' + pTop
                    + ',' + pLeft + ' ' + pTop + 'L ' + (vnode.parent.left + 10) + ',' + pTop;
            }
        },
        // 收缩和展开
        toggle: function (vnode) {
            vnode.open = !vnode.open;
            this.calcHeight(this.root);
            this.calcTop();
            console.log('toggle:', vnode, vnode.open);
        }
    }
});
