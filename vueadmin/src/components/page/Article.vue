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
                <el-table-column prop="name" label="标题" width="250"></el-table-column>
                <el-table-column prop="description" label="描述" width="500"></el-table-column>
                <el-table-column prop="created_at" label="创建时间" :formatter="formatter" sortable></el-table-column>
                <el-table-column prop="updated_at" label="修改时间" :formatter="formatter" sortable></el-table-column>
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
    export default {
        name: 'item',
        data() {
            return {
                oldName: '',
                dialogTitle: '编辑',
                dialogAccessTitle: '权限设置',
                select_word: '',
                totalCount: 0,
                pageSize: 10,
                tableDataItem: [],
                cur_page: 1,
                editVisible: false,
                delVisible: false,
                editAccessVisible: false,
                form: {
                    name: '',
                    description: '',
                    type:'',
                },
                deleteName: '',
                deleteType:'',
                content: '',
                editorOption: {
                    placeholder: 'Hello World'
                }
            }
        },
        components: {
            quillEditor
        },
        created() {
            this.getData();
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get(this.GLOBAL.serverSrc + "/rbacs/permissions", {params:{
                    limit: this.pageSize,
                    page: this.cur_page,
                    description: this.select_word,
                    type: this.typeSearch
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
            getAccessList() {
                this.$axios.get(this.GLOBAL.serverSrc + "/rbacs/permissions", {params:{
                    limit: 10000,
                    page: 1,
                    type: this.nodeType.node
                }}).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.accessList = response.data.data.list;
                        return;
                    }
                    this.$message.error(response.data.message);
                }).catch(function (error) {
                    this.$message.error('error request');
                });
            },
            getAccess() {
                this.$axios.get(this.GLOBAL.serverSrc + "/rbacs/nodes", {params:{
                    role_name: this.role_name,
                }}).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.access = response.data.data;
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
            formatter_type(row, column) {
                return row.type == 1 ? '角色' : '权限节点';
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleCreate(){
                this.dialogTitle = '新增';
                this.form = {
                    name: '',
                    description: ''
                }
                this.editVisible = true;
            },
            handleAccess(index, row){
                const item = this.tableDataItem[index];
                this.editAccessVisible = true;
                this.role_name = '';
                this.role_name = item.name;
                this.getAccessList();
                this.getAccess();
            },
            handleEdit(index, row) {
                this.dialogTitle = '编辑';
                this.idx = index;
                const item = this.tableDataItem[index];
                this.form = {
                    name: item.name,
                    description: item.description
                };
                this.optionDefaultValue = item.type;
                this.editVisible = true;
                this.oldName = item.name;
            },
            handleDelete(index, row) {
                this.deleteName = row.name;
                this.deleteType = row.type;
                this.delVisible = true;
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit(dialogTitle)
            {
                // 新增节点
                if (dialogTitle == '新增') {
                    var uri = "/rbacs/permissions";
                    var params = {
                        type: this.optionDefaultValue,
                        name: this.form.name,
                        description: this.form.description
                    };
                }

                // 编辑节点
                if (dialogTitle == '编辑') {
                    var uri = "/rbacs/update";
                    var params = {
                        type: this.optionDefaultValue,
                        name: this.form.name,
                        description: this.form.description,
                        oldName: this.oldName
                    };
                }

                // 发送请求
                this.$axios.post(this.GLOBAL.serverSrc + uri, params).then((response) => {
                    if (response.data.success && response.data.code == 0) {
                        this.editVisible = false;
                        this.$message.success(response.data.message);
                        this.getData();
                        return;
                    }
                    this.$message.error(response.data.message);
                }).catch(function (error) {
                    this.$message.error('error request');
                });
            },
            // 确定删除
            deleteRow(){
                this.$axios.delete(this.GLOBAL.serverSrc + '/rbacs/permissions', {data:{
                    name:this.deleteName,
                    type:this.deleteType
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
