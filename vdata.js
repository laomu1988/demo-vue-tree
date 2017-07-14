/**
 * @file 使用vue渲染数据
 * @author muzhilong
 */
var width = 800;
var height = 600;
var blockHeight = 30;

/* global Vue,json*/
new Vue({
    el: '#app',
    data: {
        json: json,
        show: json,
        test: 'test'
    },
    computed: {
        list: function () {
            this.initData(this.show);
            var list = [];
            list.push(this.show);
            var index = 0;
            while (index < list.length) {
                var children = list[index].children;
                if (children && children.length > 0) {
                    children.forEach(v => {
                        list.push(v);
                    });
                }

                index += 1;
            }
            return list;
        },
        // 分层数据
        levels: function () {
            var arr = [];
            this.list.forEach(function (v) {
                if (!arr[v.deep]) {
                    arr[v.deep] = [];
                }

                var level = arr[v.deep];
                v.prev = level[level.length - 1];
                level.push(v);
                v.left = v.deep * 150 + 10;
            });
            this.calcTop();
            return arr;
        }
    },
    mounted() {
        console.log('mounted');
        console.log(this.levels);
    },
    methods: {
        // 初始化数据： 计算deep等
        initData: function (data) {
            if (!data.deep) {
                data.deep = 0;
            }

            var me = this;
            var height = 0;
            if (data.children && data.children.length > 0) {
                data.children.forEach(function (v, index) {
                    v.parent = data;
                    v.deep = data.deep + 1;
                    v.index = index;
                    me.initData(v);
                    height += v.height;
                });
            }

            data.height = height || blockHeight;
        },
        calcTop() {
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
                    // var mLeft = (v.left * 2 + v.parent.left) / 3;
                    // var mTop = (v.top + v.parent.top) / 2;
                    // v.path = 'M' + v.left + ' ' + v.top
                    // + ' Q ' + mLeft + ' ' + v.top + ' ' + mLeft + ' ' + mTop
                    // + 'T ' + v.parent.left + ' ' + v.parent.top;
                    var pLeft = v.parent.left + 65;
                    var pTop = v.parent.top;
                    var mLeft = (v.left + pLeft) / 2;
                    var mTop = (v.top + pTop) / 2;
                    v.path = 'M' + v.left + ' ' + v.top
                    + ' C ' + mLeft + ' ' + v.top + ',' + mLeft + ' ' + pTop
                    + ',' + pLeft + ' ' + pTop;
                }

                // var prev = (v.parent && v.parent.prev) || v.prev;
                // v.top = v.height / 2 + (prev ? prev.top + prev.height / 2 : 0);
                // v.top = v.height / 2 + (v.prev ? v.prev.top + v.prev.height / 2 : 0);
            });
        }
    }
});
