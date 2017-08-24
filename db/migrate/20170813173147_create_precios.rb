class CreatePrecios < ActiveRecord::Migration[5.1]
  def change
    create_table :precios do |t|
      t.integer :precio
      t.string :tipo
      t.references :pet, foreign_key: true

      t.timestamps
    end
  end
end
