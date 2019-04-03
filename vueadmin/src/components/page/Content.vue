<template>
    <div>
        <div class="container">
            <el-form ref="form" :model="form" label-width="50px">
                <el-form-item label="标题:">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="分类:">
                    <el-select v-model="form.type" placeholder="请选择类" style="width:100%">
                        <el-option v-for="item in tagData" :label="item.name" :value="item.name" :key="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="描述:">
                    <el-input v-model="form.description"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <quill-editor v-model="form.intro"
                                  ref="myQuillEditor"
                                  :options="editorOption">
                    </quill-editor>
                </el-form-item>
            <el-button class="editor-btn" type="primary" @click="submit">提交</el-button>
            </el-form>
        </div>
    </div>
</template>


<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import {quillRedefine} from 'vue-quill-editor-upload';
    import { quillEditor } from 'vue-quill-editor';

    export default {
        name: 'content',
        data: function(){
            return {
                editorOption: {},
                form: {
                    title: '',
                    type:'',
                    intro:'',
                    description:'',
                },
                tagData:[],
            }
        },
        components: {quillEditor, quillRedefine},
        created () {
            this.getTagData();
            this.editorOption = quillRedefine(
                {
                    // 图片上传的设置
                    uploadConfig: {
                        action: this.GLOBAL.serverSrc + "/articles/upload",  // 必填参数 图片上传地址
                        // 必选参数  res是一个函数，函数接收的response为上传成功时服务器返回的数据
                        // 你必须把返回的数据中所包含的图片地址 return 回去
                        res: (respnse) => {
                           //console.log(respnse);
                            return respnse.data.image;

                        },
                        methods: 'POST',  // 可选参数 图片上传方式  默认为post
                        //User-Token: sessionStorage.getItem('ms_user_token'),  // 可选参数 如果需要token验证，假设你的token有存放在sessionStorage
                        name: 'img',  // 可选参数 文件的参数名 默认为img
                        size: 500,  // 可选参数   图片限制大小，单位为Kb, 1M = 1024Kb
                        accept: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon',  // 可选参数 可上传的图片格式
                        // input点击事件  formData是提交的表单实体
                        change: (formData) => {
                        },
                        // 设置请求头 xhr: 异步请求， formData: 表单对象
                        header: (xhr, formData) => {
                            xhr.setRequestHeader('User-Token', sessionStorage.getItem('ms_user_token'));
                            // formData.append('token', '1234')
                        },
                        // start: function (){}
                        start: () => {
                            console.log(this.GLOBAL.serverSrc + "/articles/upload");
                        },  // 可选参数 接收一个函数 开始上传数据时会触发
                        end: () => {
                        },  // 可选参数 接收一个函数 上传数据完成（成功或者失败）时会触发
                        success: () => {
                        },  // 可选参数 接收一个函数 上传数据成功时会触发
                        error: () => {
                        }  // 可选参数 接收一个函数 上传数据中断时会触发
                    }
                }
            )
            //console.log(this.editorOption.uplpadConfig)
        },
        methods:{
            submit(){
                var params = {
                    category_name: this.form.type,
                    content: this.form.intro,
                    title: this.form.title,
                    describe: this.form.description,
                };

                this.$axios.post(this.GLOBAL.serverSrc + '/articles', params).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.$message.success(response.data.message);
                        this.$router.push('/article');
                        return;
                    }
                    this.$message.error(response.data.message);
                }).catch(function (error) {
                    this.$message.error('error request');
                });
            },
            getTagData() {
                this.$axios.get(this.GLOBAL.serverSrc + "/tags", {params:{
                    limit: 100,
                    page: 1
                }}).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.tagData = response.data.data.list;
                        return;
                    }
                    this.$message.error(response.data.message);
                }).catch(function (error) {
                    this.$message.error('error request');
                });
            },
        }
    }
</script>
<style scoped>

</style>