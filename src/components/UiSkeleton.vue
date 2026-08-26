<script>
import { computed, defineComponent, h, ref, renderSlot } from 'vue'
import { useLocale } from '../config-runtime.js'
import { safeLength } from '../layout.js'

// Runtime slot contract: <slot name="default"><slot name="template"><slot name="avatar"><slot name="title"><slot name="row">
// CSS contract classes: class="ui-skeleton ui-skeleton-placeholder ui-skeleton-avatar ui-skeleton-content ui-skeleton-title ui-skeleton-line"
const props={
  rows:{type:Number,default:3},avatar:Boolean,animated:{type:Boolean,default:true},width:{type:[String,Number],default:'100%'},
  loading:{type:Boolean,default:true},title:Boolean,titleWidth:{type:[String,Number],default:'38%'},rowWidths:{type:Array,default:()=>[]},
  avatarSize:{type:[String,Number],default:38},avatarShape:{type:String,default:'circle',validator:value=>['circle','square'].includes(value)},
  round:Boolean,ariaLabel:{type:String,default:''},
}
function normalizeRows(value){return Number.isFinite(value)?Math.max(0,Math.min(100,Math.floor(value))):3}

export default defineComponent({
  name:'UiSkeleton',inheritAttrs:false,props,
  setup(props,{expose,slots,attrs}){
    const root=ref(null),{t}=useLocale()
    const rows=computed(()=>normalizeRows(props.rows)),width=computed(()=>safeLength(props.width,'100%'))
    const titleWidth=computed(()=>safeLength(props.titleWidth,'38%')),avatarSize=computed(()=>safeLength(props.avatarSize,'38px'))
    const rowWidths=computed(()=>props.rowWidths.map(value=>safeLength(value,width.value)))
    const rowWidth=index=>rowWidths.value[index]??(index===rows.value-1&&rows.value>1?'72%':width.value)
    const state=()=>Object.freeze({loading:props.loading,rows:rows.value,avatar:props.avatar,animated:props.animated,title:props.title,width:width.value,titleWidth:titleWidth.value,rowWidths:Object.freeze([...rowWidths.value]),avatarSize:avatarSize.value,avatarShape:props.avatarShape,round:props.round})
    const scope=index=>({index,width:rowWidth(index),size:10,shape:'line',loading:props.loading})
    const fallback=()=>[
      props.avatar?renderSlot(slots,'avatar',{size:avatarSize.value,shape:props.avatarShape,loading:props.loading},()=>[h('span',{class:['ui-skeleton-avatar',`shape-${props.avatarShape}`],style:{width:avatarSize.value,height:avatarSize.value}})]):null,
      h('div',{class:'ui-skeleton-content'},[
        props.title?renderSlot(slots,'title',{width:titleWidth.value,loading:props.loading},()=>[h('span',{class:'ui-skeleton-title',style:{width:titleWidth.value}})]):null,
        ...Array.from({length:rows.value},(_,index)=>renderSlot(slots,'row',scope(index),()=>[h('span',{class:'ui-skeleton-line',style:{width:rowWidth(index)}})])),
      ]),
    ]
    expose({getElement:()=>root.value,getState:state})
    return ()=>{
      const loading=props.loading
      const rootProps={...attrs,class:['ui-skeleton',attrs.class,{animated:props.animated,round:props.round,loaded:!loading}],style:attrs.style,role:loading?'status':undefined,'aria-live':loading?'polite':undefined,'aria-busy':loading?'true':'false','aria-label':loading?(props.ariaLabel||t('skeleton.loading')):undefined}
      const content=loading?[h('div',{class:'ui-skeleton-placeholder','aria-hidden':'true'},slots.template?renderSlot(slots,'template',state()):fallback())]:renderSlot(slots,'default')
      return h('div',{...rootProps,ref:root},content)
    }
  },
})
</script>
