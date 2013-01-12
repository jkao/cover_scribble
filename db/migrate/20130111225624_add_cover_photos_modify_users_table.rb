class AddCoverPhotosModifyUsersTable < ActiveRecord::Migration
  def up
    create_table :cover_photos do |t|
      t.string :url

      t.timestamps
    end

    create_table :users_cover_photos do |t|
      t.string :user_id
      t.string :cover_photo_id
      t.string :drawer_id

      t.timestamps
    end

    remove_column :users, :email
  end

  def down
    drop_table :cover_photos
    drop_table :users_cover_photos

    add_column :users, :email, :string
  end
end
