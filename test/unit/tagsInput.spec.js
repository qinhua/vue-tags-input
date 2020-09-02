/* 引入依赖 */
import { mount } from '@vue/test-utils';
import TagsInput from '../../src/tagsInput/TagsInput.vue';

/* 测试用例 */
describe('\n====== TagsInput组件测试 ======\n\n>>> 基本功能测试\n', () => {
  const instance = mount(TagsInput, {
    propsData: {
      config: {
        mode: 1,
        sortable: true
      },
      tags: ['skating', 'gliding', 'diving']
    }
  })
  var wrapper = instance.find('.vx-tags-input');

  it('组件是否渲染成功', () => {
    expect(wrapper.classes()).toContain('vx-tags-input');
  })
  it('设置组件模式', () => {
    expect(wrapper.classes()).toContain('editMode');
  })
  it('默认标签是否填充', () => {
    expect(wrapper.find('.tags-list').html()).toContain('diving');
  })
  it('是否可添加标签', () => {
    const ele = wrapper.find('.addTag');
    ele.setValue('一个崭新的标签');
    ele.trigger('keydown.enter');
    expect(wrapper.find('.tags-list').html()).toContain('一个崭新的标签');
  })
  it('是否可删除标签', () => {
    wrapper.find('.addTag').setValue('一个还没删除的标签');
    wrapper.findAll('.t-del').at(wrapper.findAll('.t-del').length - 1).trigger('click');
    expect(wrapper.find('.tags-list').html()).not.toContain('一个还没删除的标签');
  })
  it('是否可拖拽排序', () => {
    const eles = wrapper.findAll('.t-item');
    const curText = eles.at(0).text();
    eles.at(0).trigger('touchstart', {
      pageX: 50,
      pageY: 80
    });
    var evt = new Event('touchmove');
    eles.at(0).trigger('touchmove', {
      pageX: 300
    });
    expect(instance.vm.touchMoved).toBeTruthy();
  })
  /* it('>生成测试快照', () => {   
    expect(instance.vm.$el).toMatchSnapshot();
  })  */
})

describe('\n>>> 参数测试\n', () => {
  const instance = mount(TagsInput, {
    propsData: {
      config: {
        max: 2,
        minChar: 3,
        maxChar: 10,
        trimValue: true,
        addOnblur: true,
        showToast: true,
        errorTip: true,
        errorCls: "xxx-error",
        removeWithBackspace: true,
        placeholderText: '自定义的placeholder文字'
      }
    }
  })
  var wrapper = instance.find('.vx-tags-input');
  it('设置placeholder文字', () => {
    expect(wrapper.find('.addTag').attributes('placeholder')).toBe('自定义的placeholder文字');
  })
  it('最大标签数量限制', () => {
    const ele = wrapper.find('.addTag');
    ele.setValue('标签1');
    ele.trigger('keydown.enter');
    ele.setValue('标签2');
    ele.trigger('keydown.enter');
    ele.setValue('标签3');
    ele.trigger('keydown.enter');
    expect(wrapper.find('.tags-list').html()).not.toContain('标签3');
  })
  it('单个标签最小字符限制', () => {
    instance.vm.tagsData = [];
    const ele = wrapper.find('.addTag');
    ele.setValue('二哥');
    ele.trigger('keydown.enter');
    expect(wrapper.find('.tags-list').html()).not.toContain('二哥');
  })
  it('单个标签最大字符限制', () => {
    const ele = wrapper.find('.addTag');
    expect(ele.attributes().maxlength).toEqual('10');
  })
  it('正则表单式校验', () => {
    const wrp = mount(TagsInput, {
      propsData: {
        config: {
          pattern: /[0-9]{1,2}/
        }
      }
    })
    const ele = wrp.find('.addTag');
    ele.setValue('一个错误的标签');
    ele.trigger('keydown.enter');
    expect(wrp.find('.tags-list').html()).not.toContain('一个错误的标签');
  })
  it('去除首尾空格', () => {
    instance.vm.tagsData = [];
    const ele = wrapper.find('.addTag');
    ele.setValue(' 一个崭新的标签    ');
    ele.trigger('keydown.enter');
    expect(wrapper.findAll('.t-item').at(0).text()).toEqual('一个崭新的标签');
  })
  it('失去焦点时自动添加标签', () => {
    instance.vm.tagsData = [];
    const ele = wrapper.find('.addTag');
    ele.setValue('这是blur添加的标签');
    ele.trigger('keydown.enter');
    expect(wrapper.find('.tags-list').html()).toContain('这是blur添加的标签');
  })
  it('按退格键删除标签', () => {
    instance.vm.tagsData = [];
    const ele = wrapper.find('.addTag');
    ele.setValue('退格键测试');
    ele.trigger('keydown.enter');
    ele.trigger('keydown.backspace');
    expect(wrapper.find('.tags-list').html()).not.toContain('退格键测试');
  })
  it('是否显示Toast提示', () => {
    expect(instance.vm.toast !== undefined).toBeTruthy();
  })
  it('错误样式反馈', () => {
    instance.vm.tagsData = [];
    const ele = wrapper.find('.addTag');
    ele.setValue('那');
    ele.trigger('keydown.enter');
    expect(wrapper.classes()).toContain('xxx-error');
  })
})