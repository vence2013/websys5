/****************************************************************************** 
 * 文件名称 ： tag.js
 * 功能说明 ： file
 * 
 * 创建日期 ： 2019/04/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/27    - 创建文件。
 *****************************************************************************/


/* 关联标签到文件 */
exports.attach = async (ctx, userid, fileid, tagname)=>{
    const Tag = ctx.models['Tag'];
    const File = ctx.models['File'];

    var fileIns = await File.findOne({logging:false, where:{'id': fileid, 'ownerId':userid}});
    if (!fileIns) return -1;

    var tagIns  = await Tag.findOne({logging: false, 'where': {'name': tagname} })
    if (tagIns) { await fileIns.addTag(tagIns, {logging: false}); }
    return 0;
}


exports.dettach = async (ctx, userid, fileid, tagname)=>{
    const Tag = ctx.models['Tag'];
    const File = ctx.models['File'];

    var fileIns = await File.findOne({logging:false, where:{'id': fileid, 'ownerId':userid}});
    if (!fileIns) return -1;

    var tagIns  = await Tag.findOne({logging: false, 'where': {'name': tagname} })
    if (fileIns && tagIns) { await fileIns.removeTag(tagIns, {logging: false}); }
    return 0;
}


/* 获取文件关联的标签 */
exports.getByFile = async (ctx, fileid)=>{
    const Tag = ctx.models['Tag'];
    const File = ctx.models['File'];

    var res = await File.findAll({raw: true, logging: false, attributes: [], 
        where: {'id': fileid},
        include: [{ model: Tag, attributes: ['name'] }]
    });

    var taglist = [];
    res.map((x)=>{ if(x['Tags.name']) taglist.push(x['Tags.name']); });
    return taglist;
}