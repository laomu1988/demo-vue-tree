/**
 * @file 使用vue渲染数据
 * @author muzhilong
 */
var width = 800;
var height = 600;

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

            data.height = height || 30;
        },
        calcTop() {
            this.list.forEach(function (v) {
                // var prev = (v.parent && v.parent.prev) || v.prev;
                // v.top = v.height / 2 + (prev ? prev.top + prev.height / 2 : 0);
                v.top = v.height / 2 + (v.prev ? v.prev.top + v.prev.height / 2 : 0);
            });
        }
    }
});
