export const getUser = async (user_id: string, models: any) => {
  const Model = models.User;
  const user = Model.findById(user_id)
  return user
};
