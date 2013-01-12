class RenameUserCoverPhotos < ActiveRecord::Migration
  def up
    rename_table :users_cover_photos, :user_cover_photos
  end

  def down
    rename_table :user_cover_photos, :users_cover_photos
  end
end
