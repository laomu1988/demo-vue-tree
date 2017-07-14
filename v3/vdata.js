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
        rules: {
            min: 200,
            max: 350
        },
        delayRules: {
            min: 10,
            max: 300
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
                v.lineRed = false; // 线条是否标红
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
                if (v.delay >= me.delayRules.min && v.delay <= me.delayRules.max) {
                    v.lineRed = true;
                    if (!v.red) {
                        var p = v.parent;
                        while (p) {
                            p.open = true;
                            p = p.parent;
                        }
                    }
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
            this.calcHeight(this.root);
            this.calcTop();
            console.log('toggle:', vnode, vnode.open);
        }
    }
});
