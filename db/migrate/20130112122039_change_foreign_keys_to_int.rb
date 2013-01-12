class ChangeForeignKeysToInt < ActiveRecord::Migration
  def up
    change_column :user_cover_photos, :user_id, :integer
    change_column :user_cover_photos, :cover_photo_id, :integer
    change_column :user_cover_photos, :drawer_id, :integer
  end

  def down
    change_column :user_cover_photos, :user_id, :string
    change_column :user_cover_photos, :cover_photo_id, :string
    change_column :user_cover_photos, :drawer_id, :string
  end
end
