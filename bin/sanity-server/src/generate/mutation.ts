import mongoose from "mongoose";

const convertGraphqlInputFieldType = (field: any) => {
  switch (field.type) {
    case "string":
      return "String";
    case "slug":
      return "String";
    case "image":
      return "ID";
    case "array":
      return `[${field.of.map((ofType: any) => convertGraphqlInputFieldType(ofType)).join(", ")}]`;
    case "reference":
      return "ID";
    case "datetime":
      return "DateTime";
    case "date":
      return "Date";
    case "file":
      return "String"; // todo file
    case "geopoint":
      return "String"; // todo geopoint
    case "number":
      return "Float";
    case "object":
      return "String"; // todo object
    case "text":
      return "String";
    case "url":
      return "String";
    case "blockContent":
      return "JSON";
    case "boolean":
      return "Boolean";
    default:
      return field.type.charAt(0).toUpperCase() + field.type.slice(1) + "Input";
  }
};

export const generateMutations = (type: any, fields: any, models: any) => {
  const name = type.charAt(0).toUpperCase() + type.slice(1);

  const createInputFields = fields
    .map((field: any) => {
      if (field.type !== "array") {
        const fieldType = convertGraphqlInputFieldType(field);
        return `${field.name}: ${fieldType}`;
      }
    })
    .join("\n    ");

  // 删除字段
  const patchUnsetInputFields = fields
    .map((field: any) => {
      return `${field.name}: String`;
    })
    .join("\n    ");

  const hasNumberField = fields.some((field: any) => field.type === "number");

  // 数字字段
  const patchDecOrIncInputFields = fields
    .map((field: any) => {
      if (field.type == "number") {
        return `${field.name}: Float`;
      }
    })
    .join("\n    ");

  const hasArrayField = fields.some((field: any) => field.type === "array");

  // 数组字段
  const patchInsertFields = fields
    .map((field: any) => {
      if (field.type == "array") {
        return `${field.name}: ID`; //todo 不止关联id
      }
    })
    .join("\n    ");

  return {
    typeDefs: `
      input create${name}Input {
          _id: ID
          ${createInputFields}
      }

      input createOrReplace${name}Input {
          _id: ID!
          ${createInputFields}
      }

      input delete${name}Input {
            id: ID!
      }

      input patchSet${name}Input {
        ${createInputFields}
      }

      input patchSetIfMissing${name}Input {
        ${createInputFields}
      }

      input patchUnset${name}Input {
        ${patchUnsetInputFields}
      }

      ${
        hasNumberField
          ? `
        input patchInc${name}Input {
        ${patchDecOrIncInputFields}
      }

      input patchDec${name}Input {
        ${patchDecOrIncInputFields}
      }

        `
          : ""
      }

      ${
        hasArrayField
          ? `
         input patchInsert${name}Input {
            ${patchInsertFields}
        }
        `
          : ""
      }
      
     

      input patch${name}Input {
        id: ID!
        set: patchSet${name}Input
        setIfMissing: patchSetIfMissing${name}Input
        unset: patchUnset${name}Input #删除字段
        ${
          hasNumberField
            ? `
        inc: patchInc${name}Input #对数值字段递增操作
        dec: patchDec${name}Input #对数值字段递减操作
            `
            : ""
        }
        ${hasArrayField ? `insert: patchInsert${name}Input #对数组字段插入新值` : ""}
      }
  
      `,
    mutaionField: `
  
      create${name}(input: create${name}Input!): ${name}!
      
      createOrReplace${name}(input: createOrReplace${name}Input!): ${name}!
  
      createIfNotExists${name}(input: createOrReplace${name}Input!): ${name}!
  
      delete${name}(input: delete${name}Input!): String
  
      patch${name}(input: patch${name}Input!): ${name}!

      `,
    resolvers: {
      Mutation: {
        [`create${name}`]: async (
          _parent: null,
          { input }: any,
          context: any
        ) => {
          const model = await create(
            context,
            input,
            fields,
            models,
            name,
            type
          );
          return model;
        },
        [`createOrReplace${name}`]: async (
          _parent: null,
          { input }: any,
          context: any
        ) => {
          const { _id, ...arg } = input;
          const Model = models?.[name];
          const existingModel = await Model.findById(_id);
          if (existingModel) {
            await deleteDocument(input, models, name);
          }
          const model = await create(
            context,
            input,
            fields,
            models,
            name,
            type
          );
          return model;
        },
        [`createIfNotExists${name}`]: async (
          _parent: null,
          { input }: any,
          context: any
        ) => {
          const { _id } = input;
          const Model = models?.[name];
          const existingModel = await Model.findById(_id);
          if (existingModel) {
            return existingModel;
          }
          // 通用创建
          const model = await create(
            context,
            input,
            fields,
            models,
            name,
            type
          );
          return model;
        },
        [`delete${name}`]: async (_parent: null, { input }: any) => {
          await deleteDocument(input, models, name);
          return "Deleted successfully";
        },
        [`patch${name}`]: async (_parent: null, { input }: any) => {
          const { id, set, setIfMissing, unset, inc, dec, insert } = input;
          const Model = models?.[name];
          const updateFields: any = {};
          if (set) updateFields.$set = set;
          if (setIfMissing) updateFields.$setOnInsert = setIfMissing;

          // todo 如果先删除数组，再insert 是发生错误
          if (unset) updateFields.$unset = unset;
          if (inc) updateFields.$inc = inc;
          if (dec) updateFields.$dec = dec;

          // todo 这个插入是不会去重的
          if (insert) updateFields.$push = insert;
          const model = await Model.findByIdAndUpdate(
            id,
            {
              _updatedAt: new Date(),
              ...updateFields,
            },
            {
              new: true,
            }
          );
          return model;
        },
      },
    },
  };
};

const create = async (
  context: any,
  input: any,
  fields: any,
  models: any,
  name: string,
  type: any
) => {
  const userId = context.user._id;
  const { _id, ...arg } = input;
  // 找到object类型
  const objectTypeListField: any[] = [];
  fields.forEach((field: any) => {
    if (
      field.type !== "string" &&
      field.type !== "slug" &&
      field.type !== "image" &&
      field.type !== "array" &&
      field.type !== "reference" &&
      field.type !== "datetime" &&
      field.type !== "date" &&
      field.type !== "file" &&
      field.type !== "geopoint" &&
      field.type !== "number" &&
      field.type !== "object" &&
      field.type !== "text" &&
      field.type !== "url" &&
      field.type !== "blockContent" &&
      field.type !== "boolean"
    ) {
      objectTypeListField.push(field);
    }
  });
  const inputObjectList: string[] = [];
  if (objectTypeListField.length > 0) {
    objectTypeListField.forEach((field) => {
      if (!!arg?.[field.name]) {
        inputObjectList.push(field.name);
      }
    });
  }

  const inputObjectModels: any = {};

  if (inputObjectList.length > 0) {
    inputObjectList.forEach(async (inputObject) => {
      const inputObjectType = objectTypeListField.find(
        (field) => field.name === inputObject
      );
      const InputObjectModel =
        models?.[
          inputObjectType.type.charAt(0).toUpperCase() +
            inputObjectType.type.slice(1)
        ];
      const inputObjectModel = new InputObjectModel({
        ...arg?.[inputObject],
      });
      inputObjectModels[inputObject] = inputObjectModel._id;
      await inputObjectModel.save();
    });
  }

  const Model = models?.[name];

  inputObjectList.forEach((i) => {
    delete arg[i];
  });

  const model = new Model({
    _id: _id ? new mongoose.Types.ObjectId(_id) : new mongoose.Types.ObjectId(),
    _type: type,
    _createdAt: new Date(),
    _updatedAt: new Date(),
    userPermissions: [
      {
        user: userId,
        canRead: true,
        canEdit: true,
        canDelete: true,
      },
    ],
    ...inputObjectModels,
    ...arg,
  });

  const typeReference = fields.find((field: any) => field.type === "reference");

  if (!!typeReference) {
    const to = typeReference.to.type;
    const referenceModel = models?.[to.charAt(0).toUpperCase() + to.slice(1)];
    const id = input?.[to];
    const modelId = model._id.toString();
    // todo 这里需要区分 to 文档 对自己是array还是
    await referenceModel.findByIdAndUpdate(
      id,
      {
        $set: { [`${type}`]: modelId },
      },
      { new: true }
    );

    await referenceModel.findByIdAndUpdate(
      id,
      {
        $push: { [`${type}s`]: modelId },
      },
      { new: true }
    );
  }
  // await userPermission.save()

  await model.save();
  return model;
};

const deleteDocument = async (input: any, models: any, name: any) => {
  const { id } = input;
  const Model = models?.[name];
  await Model.findByIdAndDelete(id);
  // todo 删除需要把关联的给删除，因为是强绑定 除非weak：true
  // todo 删除object的关联
};
