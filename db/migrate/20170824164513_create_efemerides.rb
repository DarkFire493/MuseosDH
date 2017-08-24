class CreateEfemerides < ActiveRecord::Migration[5.1]
  def change
    create_table :efemerides do |t|
      t.integer :numero
      t.string :descripcion

      t.timestamps
    end
  end
end
