class CreateQrCodeReaders < ActiveRecord::Migration[5.1]
  def change
    create_table :qr_code_readers do |t|
      t.string :disscount
      t.string :person
      t.date :checkin

      t.timestamps
    end
  end
end
