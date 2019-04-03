<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-tickets"></i> 文章标签管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="name" placeholder="输入标签名" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
                <el-button size="small" style="float:right" @click="handleCreate">新增标签</el-button><div style="clear:both"></div>
            </div>
            <el-table :data="tableDataItem" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" label="标签名" width="200"></el-table-column>
                <el-table-column prop="_id" label="标签id" width="200"></el-table-column>
                <el-table-column prop="create_time" label="创建时间" :formatter="formatter" sortable></el-table-column>
                <el-table-column prop="update_time" label="更新时间" :formatter="formatter" sortable></el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalCount"  :page-size="pageSize">
                </el-pagination>
            </div>
        </div>


        <!-- 编辑弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item label="标签名">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit(dialogTitle)">确 定</el-button>
            </span>
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
    import {formatDate} from '../common/date.js';
    export default {
        name: 'tag',
        data() {
            return {
                dialogTitle: '编辑',
                name: '',
                totalCount: 0,
                pageSize: 10,
                tableDataItem: [],
                cur_page: 1,
                editVisible: false,
                delVisible: false,
                form: {
                    name: '',
                },
                roleData:[],
                tag_id:''
            }
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
                this.$axios.get(this.GLOBAL.serverSrc + "/tags", {params:{
                    limit: this.pageSize,
                    page: this.cur_page,
                    name: this.name
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
            search(event) {
                this.getData();
            },
            formatter(row, column) {
                var date = row[column.property] * 1000;
                var date = new Date(date);
                return !row[column.property] ? "" : formatDate(date, 'yyyy-MM-dd hh:mm');
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleCreate(){
                this.dialogTitle = '新增';
                this.form = {
                    name: ''
                }
                this.editVisible = true;
            },
            handleEdit(index, row) {
                this.dialogTitle = '编辑';
                this.idx = index;
                const item = this.tableDataItem[index];
                this.form = {
                    name: item.name
                };
                this.tag_id = item._id;
                this.editVisible = true;
            },
            handleDelete(index, row) {
                this.tag_id = row._id;
                this.delVisible = true;
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 保存编辑
            saveEdit(dialogTitle)
            {
                // 新增用户
                if (dialogTitle == '新增') {
                    var uri = "/tags";
                    var params = {
                        name: this.form.name
                    };
                }

                // 编辑用户
                if (dialogTitle == '编辑') {
                    var uri = "/tags/update";
                    var params = {
                        name: this.form.name,
                        id: this.tag_id,
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
                this.$axios.delete(this.GLOBAL.serverSrc + '/tags/delete', {data:{
                    _id:this.tag_id
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
</style>
