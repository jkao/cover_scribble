class AddBase64ColumnToCoverPhotos < ActiveRecord::Migration
  def change
    add_column :cover_photos, :img_code, :text
  end
end
