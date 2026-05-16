import argparse
import os
import numpy as np
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# This script assumes you have a dataset organized as:
# ml_models/data/train/<emotion_name>/*.jpg
# ml_models/data/test/<emotion_name>/*.jpg
# Emotions should match the labels used in backend/core/utils.py.

EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']


def residual_block(x, filters, kernel=(3, 3), strides=(1, 1)):
    shortcut = layers.Conv2D(filters, (1, 1), strides=strides, padding='same', use_bias=False)(x)
    shortcut = layers.BatchNormalization()(shortcut)

    x = layers.SeparableConv2D(filters, kernel, padding='same', use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.SeparableConv2D(filters, kernel, padding='same', use_bias=False)(x)
    x = layers.BatchNormalization()(x)

    x = layers.MaxPooling2D((2, 2), strides=strides, padding='same')(x)
    x = layers.add([x, shortcut])
    return x


def build_model(input_shape=(64, 64, 1), num_classes=len(EMOTION_LABELS)):
    inputs = layers.Input(shape=input_shape)

    x = layers.Conv2D(32, (3, 3), padding='same', use_bias=False)(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)

    x = residual_block(x, 64)
    x = residual_block(x, 128)
    x = residual_block(x, 256)

    x = layers.SeparableConv2D(512, (3, 3), padding='same', use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.5)(x)

    x = layers.Dense(256, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)

    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = models.Model(inputs, outputs, name='mini_xception_emotion')
    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def compute_class_weights(generator):
    labels = generator.classes
    classes = np.unique(labels)
    weights = compute_class_weight('balanced', classes=classes, y=labels)
    return {int(cls): weight for cls, weight in zip(classes, weights)}


def train(train_dir, test_dir, save_path, image_size=64, batch_size=32, epochs=80):
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        brightness_range=[0.7, 1.3],
        horizontal_flip=True,
        fill_mode='nearest'
    )

    test_datagen = ImageDataGenerator(rescale=1.0 / 255.0)

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(image_size, image_size),
        color_mode='grayscale',
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=True
    )

    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=(image_size, image_size),
        color_mode='grayscale',
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )

    if train_generator.class_indices != test_generator.class_indices:
        print('Warning: training and test label order differs.')
        print('Train:', train_generator.class_indices)
        print('Test:', test_generator.class_indices)

    model = build_model(input_shape=(image_size, image_size, 1))

    checkpoint = callbacks.ModelCheckpoint(
        save_path,
        monitor='val_accuracy',
        verbose=1,
        save_best_only=True,
        mode='max'
    )
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.3,
        patience=3,
        verbose=1,
        min_lr=1e-6
    )
    early_stop = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=8,
        restore_best_weights=True,
        verbose=1
    )

    class_weights = compute_class_weights(train_generator)
    print('Class weights:', class_weights)

    steps_per_epoch = max(1, train_generator.samples // batch_size)
    validation_steps = max(1, test_generator.samples // batch_size)

    print('Starting training...')
    model.fit(
        train_generator,
        steps_per_epoch=steps_per_epoch,
        epochs=epochs,
        validation_data=test_generator,
        validation_steps=validation_steps,
        class_weight=class_weights,
        callbacks=[checkpoint, reduce_lr, early_stop]
    )

    print(f'Training complete. Best model saved to {save_path}')


def parse_args():
    parser = argparse.ArgumentParser(description='Train a facial emotion recognition model for Mind Mirror+')
    parser.add_argument('--train-dir', required=True, help='Path to the training dataset folder')
    parser.add_argument('--test-dir', required=True, help='Path to the validation/test dataset folder')
    parser.add_argument('--save-path', default=os.path.join(os.path.dirname(__file__), 'emotion_model.h5'), help='Path to save the trained model')
    parser.add_argument('--image-size', type=int, default=64, help='Input image size for the model')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--epochs', type=int, default=80, help='Maximum number of training epochs')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    train(
        train_dir=args.train_dir,
        test_dir=args.test_dir,
        save_path=args.save_path,
        image_size=args.image_size,
        batch_size=args.batch_size,
        epochs=args.epochs
    )
