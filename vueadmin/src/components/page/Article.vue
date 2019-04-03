<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-tickets"></i> 文章管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!--<el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>-->
                <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
            <el-table :data="tableDataItem" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="title" label="标题" width="100"></el-table-column>
                <el-table-column prop="describe" label="描述" width="200"></el-table-column>
                <el-table-column prop="content" label="内容"></el-table-column>
                <el-table-column prop="create_time" label="创建时间" :formatter="formatter" sortable width="200"></el-table-column>
                <el-table-column prop="update_time" label="修改时间" :formatter="formatter" sortable width="200"></el-table-column>
                <el-table-column label="操作" width="220">
                    <template slot-scope="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalCount"  :page-size="pageSize"></el-pagination>
            </div>
        </div>


        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="50%">
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
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
    import {formatDate} from '../common/date.js';
    import {quillRedefine} from 'vue-quill-editor-upload';


    export default {
        name: 'article',
        data() {
            return {
                dialogTitle: '编辑',
                select_word: '',
                totalCount: 0,
                pageSize: 10,
                tableDataItem: [],
                cur_page: 1,
                editVisible: false,
                delVisible: false,
                editorOption: {},
                form: {
                    title: '',
                    type:'',
                    intro:'',
                    description:'',
                },
                tagData:[],
                article_id:'',
            }
        },
        components: {quillEditor, quillRedefine},
        created() {
            this.getData();
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
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get(this.GLOBAL.serverSrc + "/articles", {params:{
                    limit: this.pageSize,
                    page: this.cur_page,
                    title: this.select_word,
                }}).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.tableDataItem = response.data.data.list;
                        this.totalCount = response.data.data.page.count;
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
            search(event) {
                this.getData();
            },
            formatter(row, column) {
                var date = row[column.property] * 1000;
                var date = new Date(date);
                return !row[column.property] ? '' : formatDate(date, 'yyyy-MM-dd hh:mm');
            },
            handleEdit(index, row) {
                this.getTagData();
                this.idx = index;
                const item = this.tableDataItem[index];
                this.form = {
                    title: item.title,
                    description: item.describe,
                    intro: item.content,
                    type: item.category_name,
                };
                this.article_id = item._id;
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.article_id = row._id;
                this.delVisible = true;
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            submit(){
                var params = {
                    category_name: this.form.type,
                    content: this.form.intro,
                    title: this.form.title,
                    describe: this.form.description,
                    _id:this.article_id,
                };

                this.$axios.post(this.GLOBAL.serverSrc + '/articles/update', params).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.$message.success(response.data.message);
                        this.getData();
                        this.editVisible = false;
                        return;
                    }
                    this.$message.error(response.data.message);
                }).catch(function (error) {
                    this.$message.error('error request');
                });
            },
            // 确定删除
            deleteRow(){
                this.$axios.delete(this.GLOBAL.serverSrc + '/articles/delete', {data:{
                    _id:this.article_id,
                }}).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.delVisible = false;
                        this.$message.success(response.data.message);
                        this.getData();
                        return;
                    }
                    this.$message.error(response.data.message);
                }).catch(function (error) {
                    this.$message.error('error request');
                });
            }
        }
    }

</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .editor-btn{
        margin-top: 20px;
    }
</style>
