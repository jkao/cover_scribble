class ChangeForeignKeysToInt < ActiveRecord::Migration
  def up
    drop_table :user_cover_photos

    create_table :user_cover_photos do |t|
      t.integer :user_id
      t.integer :cover_photo_id
      t.integer :drawer_id

      t.timestamps
    end
  end

  def down
    create_table :user_cover_photos do |t|
      t.string :user_id
      t.string :cover_photo_id
      t.string :drawer_id

      t.timestamps
    end
  end
end
