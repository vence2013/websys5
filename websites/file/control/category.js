/* 关联文件和目录节点
 * 返回： 文件所属的目录列表ID
 */
exports.attach = async (ctx, userid, fileid, categoryid)=>{
    const File = ctx.models['File'];
    const Category = ctx.models['Category'];

    // 关联文件和目录节点
    var fileIns = await File.findOne({logging: false, where: {'id': fileid, 'ownerId':userid}});
    if (!fileIns) return -1;

    var categoryIns = await Category.findOne({logging: false, 'where': {'id': categoryid} });
    if (categoryIns) { await fileIns.addCategory(categoryIns, {logging: false}); }

    return await get(ctx, fileid);
}


exports.dettach = async (ctx, userid, fileid, categoryid)=>{
    const File = ctx.models['File'];
    const Category = ctx.models['Category'];

    var fileIns = await File.findOne({logging: false, where: {'id': fileid, 'ownerId':userid}});
    if (!fileIns) return -1;

    var categoryIns = await Category.findOne({logging: false, 'where': {'id': categoryid} })
    if (categoryIns) { await fileIns.removeCategory(categoryIns, {logging: false}); }

    return await get(ctx, fileid);
}


exports.get = get;

async function get (ctx, fileid){
    const File = ctx.models['File'];
    const Category = ctx.models['Category'];

    // 获取文件关联的目录
    var fileObjs = await File.findAll({raw: true, logging: false, 
        attributes: [],
        where: {'id': fileid},
        include: [{
            model: Category,
            attributes: ['id']
        }]
    });
    
    var ids = fileObjs.map((x)=>{ return x['Categories.id']; });
    return ids;
}