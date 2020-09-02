/**
  * ### TagsInput组件
  * 用于输入和展示标签的场景
  * 接受props [config-配置参数，tags-默认标签数据]
  * 数据改变事件@change(type, current, data, backSpace)，
    type['add'：添加，'delete'：删除，'sort'：排序，'empty'：清空]；
    current[当前标签值]；
    data[当前标签数据]；
    backSpace[是否使用退格键删除]
*/    
<template>
  <div class="vx-tags-input-wrapper">
    <div
      :class="['vx-tags-input', configs.mode ? (configs.mode === 1 ? 'editMode' : 'disableMode') : 'displayMode', activeCls, errorCls]"
    >
      <div class="tags-wrapper">
        <ol class="tags-list" ref="tagsList">
          <li
            class="t-item"
            v-for="(item, index) in tagsData"
            @touchmove="touchMoved=true"
            :key="index"
          >
            <a href="javascript:;">{{item}}</a>
            <span class="t-del" @click="delTag(item)" v-if="config.mode!==0"></span>
          </li>
        </ol>
        <input
          type="text"
          ref="addTag"
          :class="['addTag', focusState ? 'active' :'']"
          v-model="currentValue"
          :placeholder="configs.placeholderText"
          :maxlength="configs.maxChar"
          @focus="onFocus"
          @blur="modify('blur')"
          @keydown="modify($event)"
          :disabled="config.mode===2"
          v-if="config.mode!==0"
        >
      </div>
    </div>
    <div class="vxt-toast" v-if="toastCfg.visible">{{toastCfg.content}}</div>
    <div class="vx-custom-part">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
export default {
  name: "tags-input",
  model: {
    prop: "tags",
    event: "update"
  },
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      }
    },
    tags: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      configs: {}, //组件配置
      currentValue: "", //当前标签值
      tagsData: [], //标签数据
      toastCfg: {
        visible: false, //是否可见
        content: "" //提示内容
      }, //toast配置
      focusState: false, //添加按钮是否处于焦点
      activeCls: "", //编辑状态样式类名
      errorCls: "", //错误样式类名
      touchMoved: false //标签已移动
    };
  },
  watch: {
    // 监听输入值，切换输入框状态
    currentValue(n, o) {
      this.focusState = !!n.length;
    }
  },
  mounted() {
    //复制相关数据，避免直接修改props
    this.configs = {
      ...{
        mode: 1, //组件模式[0-展示模式，1-编辑模式，2-禁用模式]，默认1
        max: null, //最大标签个数
        minChar: 1, //单个标签最少字数，默认1
        maxChar: null, //单个标签最多字数，默认null
        pattern: null, //标签规则，正则匹配（可能会与minChar,maxChar,trimValue冲突，不推荐混用），默认null
        patternTip: "", //正则错误提示文案
        sortable: true, //是否可拖动排序
        trimValue: false, //是否需要清除首尾空格
        addOnblur: false, //是否在失去焦点时候添加标签
        removeWithBackspace: true, //是否使用退格键删除
        showToast: true, //是否显示toast提示
        errorTip: true, //是否显示错误样式
        errorCls: "error", //错误样式类名,可外部定义
        placeholderText: "+ 标签" //placeholder文案
      },
      ...this.config
    };
    this.tagsData = this.tags;

    // 根据配置按需加载相关插件
    this.configs.mode === 1 && this.configs.sortable
      ? this.initSortable()
      : null; //开启拖拽排序
  },
  methods: {
    /**
     * 初始化拖拽排序
     */
    initSortable() {
      this.$nextTick(() => {
        let sortable = new Sortable(this.$refs.tagsList, {
          group: "name", // 跨列拖拽 or { name: "...", pull: [true, false, clone], put: [true, false, array] }
          sort: true, // 列表内排序
          disabled: false, //禁用
          animation: 150, // 动画持续时间
          draggable: ".t-item", // 容器内可拖动的元素
          // 元素拖动结束后
          onStart: evt => {
            // this.$emit("drag-start");
          },
          onEnd: evt => {
            let itemEl = evt.item; // 拖拽元素
            /*  evt.to; // 目标列表
            evt.from; // 来源列表
            evt.oldIndex; // 元素旧位置的索引
            evt.newIndex; // 元素新位置的索引 */
            let curItem = this.tagsData.splice(evt.oldIndex, 1)[0];
            this.tagsData.splice(evt.newIndex, 0, curItem);
            let tmpArray = Object.assign([], this.tagsData);
            this.tagsData = [];
            this.$nextTick(() => {
              this.tagsData = tmpArray;
              this.$emit("change", {
                type: "sort",
                current: curItem,
                data: this.tagsData
              });
              this.$emit("update", this.tagsData);
            });
          }
        });
      });
    },
    /**
     * 添加标签
     * value {object} 标签内容
     * index {number} 标签索引
     */
    addTag(value, index) {
      let curVal = value || this.currentValue;

      // 默认无法添加空的字符串
      if (curVal && !!!curVal.match(/^[ ]+$/)) {
        this.configs.trimValue ? (curVal = curVal.trim()) : null; //去除首尾空格

        // 验证最大标签数
        if (this.configs.max && this.tagsData.length >= this.configs.max) {
          this.toast(`最多${this.configs.max}个标签`);
          this.addErrorCls();
          this.currentValue = "";
          return false;
        }

        // 验证单个标签最小字符
        if (this.configs.minChar && curVal.length < this.configs.minChar) {
          this.toast(`最少${this.configs.minChar}个字符`);
          this.addErrorCls();
          this.currentValue = "";
          return false;
        }

        // 验证单个标签最大字符，已通过maxlength限制
        /* if (this.configs.maxChar && curVal.length > this.configs.maxChar) {
          this.toast(`最多${this.configs.maxChar}个字符`);
          this.addErrorCls();
          this.currentValue = "";
          return false;
        } */

        // 正则验证单个标签
        if (this.configs.pattern && !!!curVal.match(this.configs.pattern)) {
          this.toast(this.configs.patternTip || "标签不符合规则！");
          this.addErrorCls();
          this.currentValue = "";
          return false;
        }

        // 验证标签是否已存在
        if (!this.tagsData.includes(curVal)) {
          value
            ? this.tagsData.splice(index || this.tagsData.length + 1, 0, curVal)
            : this.tagsData.push(curVal);
        } else {
          this.toast("已有相同标签！");
          this.addErrorCls();
          return false;
        }

        // 触发change事件
        this.$emit("change", {
          type: "add",
          current: curVal,
          data: this.tagsData
        });
        this.$emit("update", this.tagsData);
        this.currentValue = "";
      } else {
        // this.toast("标签不可为空！");
        this.currentValue = "";
      }
    },
    /**
     * 删除标签
     * value {string} 当前标签
     */
    delTag(value, backspace) {
      if (this.configs.mode === 1 && this.tagsData.length) {
        if (!backspace) {
          for (let i = 0; i < this.tagsData.length; i++) {
            if (value === this.tagsData[i]) {
              this.tagsData.splice(i, 1);
            }
          }
          this.$emit("change", {
            type: "delete",
            current: value,
            data: this.tagsData
          });
        } else {
          this.tagsData.splice(this.tagsData.length - 1, 1);
          this.$emit("change", {
            type: "delete",
            current: value,
            data: this.tagsData,
            backspace: true
          });
        }
        this.$emit("update", this.tagsData);
        this.currentValue = "";
      } else {
        this.$refs.addTag.blur();
      }
    },
    /**
     * 添加标签
     * e {object} 事件对象
     * value {string} 标签内容
     */
    modify(e, value) {
      if (e === "blur") {
        this.configs.addOnblur ? this.addTag() : null;
        this.activeCls = "";
        this.focusState = false;
        return false;
      }
      if (e.keyCode === 13) {
        this.addTag();
        return false;
      }
      if (e.keyCode === 8 && this.configs.removeWithBackspace) {
        if (!this.currentValue) {
          this.delTag(value, true);
        }
        return false;
      }
    },
    /**
     * 增加标签
     * value {object} 标签内容
     * index {number} 标签索引
     */
    setItem(value, index) {
      this.addTag(value, index);
    },
    /**
     * 移除标签
     * tag {number/string} 标签索引/标签内容
     */
    removeItem(tag) {
      if (this.tagsData.length) {
        if (typeof tag === "number") {
          this.tagsData.splice(this.tagsData.length - 1, 1);
        } else {
          for (let i = 0; i < this.tagsData.length; i++) {
            if (this.tagsData[i] === tag) {
              this.tagsData.splice(i, 1);
            }
          }
        }
        this.$emit("change", {
          type: "delete",
          current: tag,
          data: this.tagsData
        });
        this.$emit("update", this.tagsData);
        this.focusState = false;
      }
    },
    /**
     * 清空标签
     * tagIndex {object} 标签索引
     */
    empty() {
      this.tagsData = [];
      this.$emit("change", {
        type: "empty",
        data: this.tagsData
      });
      this.$emit("update", this.tagsData);
      this.focusState = false;
    },
    /**
     * 禁用组件
     */
    disable() {
      this.configs.mode = 2;
      this.focusState = false;
    },
    /**
     * 获取标签数据
     */
    getData() {
      return this.tagsData;
    },
    /**
     * 添加错误样式
     */
    addErrorCls() {
      if (this.configs.errorTip) {
        this.errorCls = this.configs.errorCls;
        setTimeout(() => {
          this.errorCls = "";
        }, 1000);
      }
    },
    /**
     * 添加区域-获得焦点
     */
    onFocus() {
      this.focusState = true;
      this.activeCls = "active";
    },
    /**
     * toast提示
     * content {object} 内容
     */
    toast(content) {
      if (!this.configs.showToast) return false;
      this.toastCfg.content = content;
      this.toastCfg.visible = true;
      setTimeout(() => {
        this.toastCfg = {
          visible: false,
          content: ""
        };
      }, 2000);
    }
  }
};
</script>

<style lang="scss" scoped>
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
.vxt-toast {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  padding: 6px 10px;
  font-size: 13px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
.vx-tags-input {
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  color: #333;
  background: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 4px;
  .tags-wrapper {
    position: relative;
    overflow: hidden;
    padding: 5px 8px;
  }
  .tags-list {
    float: left;
    li {
      position: relative;
      float: left;
      margin: 3px 8px 3px 0;
      line-height: 1;
    }
    a {
      display: block;
      padding: 0 24px 0 8px;
      min-height: 28px;
      line-height: 29px;
      text-align: left;
      color: #666;
      font-size: 12px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 1px 0 4px 0 #d4d4d4;
      -webkitransition: all 0.3s ease;
      transition: all 0.3s ease;
    }
    .t-del {
      position: absolute;
      top: 50%;
      right: 6px;
      transform: translate3d(0, -50%, 0);
      cursor: pointer;
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-left: 4px;
      vertical-align: sub;
      line-height: 16px;
      font-size: 12px;
      text-align: center;
      color: #fff;
      background: #ff6161
        url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURQAAAP///////////////////////////////////////////////////////////////7eV4oIAAAAQdFJOUwD8VK5OQvhI+/kDBKympaQNhTgEAAAAqElEQVRIx+2VSw6AIAwFkY8govb+pxXRGAkVfGvpSslMqC1UIXr8L/wmuWW5eZ6fFQ2MIQdSMyusRIwReaKFFcx4GDpf1Ac/GvFuuMzQrsIzRoOPxpQZiZ9MrbI2GfZ6Sbyt9yIZJ/R4/GR85O9EsuTqcZamLHHDAPirvUXTm1sAG4ApoR+NlhVtHHo00MOHHm/0AqFXFB4C8JiBB5nwgR+VwfffyA9jB872Dd/nXDZ/AAAAAElFTkSuQmCC)
        no-repeat center;
      background-size: 90% auto;
      border-radius: 50%;
    }
  }
  .addTag {
    float: left;
    color: #666;
    width: 50px;
    height: 26px;
    margin: 5px 0 0 0;
    padding: 0 6px;
    text-align: center;
    line-height: 28px;
    font-size: 14px;
    border: none;
    background: transparent;
    border: 1px dashed #ccc;
    border-radius: 3px;
    -webkit-transition: all 0.21s linear;
    transition: all 0.21s linear;
    &::-ms-input-placeholder {
      color: #999;
    }
    &::-webkit-input-placeholder {
      color: #999;
    }
    &::-moz-placeholder {
      color: #999;
    }
    &.active {
      width: 100px;
      text-align: left;
      border-color: #999;
    }
  }
  @-webkit-keyframes errFlash {
    from {
      border-color: #ddd;
    }
    to {
      border-color: #ff6161;
      box-shadow: inset 0px 0px 4px 0px #f78383;
    }
  }
  @keyframes errFlash {
    from {
      border-color: #ddd;
    }
    to {
      border-color: #ff6161;
      box-shadow: inset 0px 0px 4px 0px #f78383;
    }
  }
  &.active {
    border-color: #94c8fd;
    box-shadow: inset 0px 0px 4px 0px #79ade2;
  }
  &.error {
    -webkit-animation: errFlash 0.25s ease-in infinite alternate;
    animation: errFlash 0.25s ease-in infinite alternate;
  }
  &.displayMode {
    background: none;
    border: none;
    border-radius: 0;
    .tags-wrapper {
      padding: 0;
      a {
        cursor: default;
        padding: 0 8px;
        background: #f7f7f7;
        box-shadow: none;
      }
    }
  }
  &.disableMode {
    -webkit-user-select: none;
    user-select: none;
    cursor: not-allowed;
    .tags-wrapper {
      a {
        cursor: not-allowed;
        background: #fdfdfd;
        box-shadow: none;
      }
    }
    .t-del {
      cursor: not-allowed;
      background-color: #ddd;
    }
    .addTag {
      cursor: not-allowed;
      &::-ms-input-placeholder {
        color: #ddd;
      }
      &::-webkit-input-placeholder {
        color: #ddd;
      }
      &::-moz-placeholder {
        color: #ddd;
      }
    }
  }
}
</style>
