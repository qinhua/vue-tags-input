<template>
  <div class="container">
    <h2>标签输入组件</h2>
    <tags-input :config="tagsConfig" v-model="tagsData" @change="tagsChange" ref="tagsInput"/>
    <dl class="result-list" v-if="tagsData.length">
      <dt>
        <div class="lft-dot">
          <i class="close"></i>
          <i class="mini"></i>
          <i class="resize"></i>
        </div>数据预览
      </dt>
      <dd v-for="(item, idx) in tagsData" :key="idx">{{item}}</dd>
    </dl>
    <p class="copyright">Copyright©2018 Chin All Rights Reserved.</p>
  </div>
</template>

<script>
import TagsInput from "./tagsInput/TagsInput";
// import TagsInput from "../dist/tagsInput.umd";

export default {
  name: "app",
  components: { TagsInput },
  data() {
    return {
      tagsConfig: {
        mode: 1, //组件模式[0-展示模式，1-编辑模式，2-禁用模式]，默认1
        max: 10, //最大标签个数
        showToast: true, //是否显示错误样式
        errorTip: true, //是否显示错误样式
        // pattern: /^.{3,6}$/, //标签规则，正则匹配（可能会与minChar,maxChar,trimValue冲突），默认null
        // patternTip: "不对哦，看看你写的正则表达式" // 正则错误提示文案
        // minChar: 2, //单个标签最少字数，默认1
        // maxChar: 5, //单个标签最多字数，默认null
        sortable: true, //是否可拖动排序
        trimValue: false, //是否需要清除首尾空格
        removeWithBackspace: true //是否使用退格键删除 */
        // placeholderText: "这里输入标签" //placeholder文案
      },
      tagsData: [] //传入的标签数据
    };
  },
  mounted() {
    // this.$refs.tagsInput.setItem("好帅的快递哥哥");
    // console.log(this.$refs.tagsInput.getData());
  },
  methods: {
    /**
     * 标签数据改变
     */
    tagsChange(data) {
      console.log("最新的标签数据：", data);
    }
  }
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
a,
input,
button {
  text-decoration: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
ul,
li {
  list-style: none;
}

// 容器
.container {
  width: 90%;
  margin: 0 auto;
}
h2 {
  padding: 20px 0;
  text-align: center;
  font-weight: normal;
  font-size: 16px;
  color: #333;
}
// 数据展示
.result-list {
  margin-top: 20px;
  padding: 10px;
  background: #45454a;
  border-radius: 5px;
  dt {
    position: relative;
    padding-bottom: 6px;
    margin-bottom: 8px;
    text-align: center;
    font-size: 14px;
    color: #f3f3f3;
    border-bottom: 1px solid #505052;
    .lft-dot {
      position: absolute;
      left: 0;
      top: 5px;
    }
    i {
      float: left;
      width: 10px;
      height: 10px;
      overflow: hidden;
      margin-right: 5px;
      border-radius: 50%;
      &.close {
        background: #ff3939;
      }
      &.mini {
        background: orange;
      }
      &.resize {
        background: #ccc;
      }
    }
  }
  dd {
    clear: both;
    display: block;
    line-height: 1.8;
    font-size: 13px;
    color: #f79a32;
  }
}
.copyright {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 10px 0;
  line-height: 1;
  font-size: 12px;
  text-align: center;
  color: #999;
}
</style>
